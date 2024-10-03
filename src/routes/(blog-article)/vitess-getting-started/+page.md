---
slug: vitess-getting-started
title: Learning Vitess - Getting started
date: 2024-09-29T01:00:00.000Z
excerpt: My little journey learning how to get started with Vitess and sharding
coverImage: /images/posts/learning-vitess/learning-vitess.jpg
tags:
  - Guide
---

# Motivation
Recently at work, I've been tasked with trying to resolve a very specific issue that one of my customer's is having with
my company's product. Not getting in to too much detail, we've got this web app, and it uses MySQL as its DB. 
Unfortunately, the DB has grown to being over a terabyte in size and this has caused the UI for the web app to start
feeling sluggish because of the extended time it's taking for queries to execute in MySQL.

There are probably a number of ways to address this issue, like setting up read-only replicas, indexing, and probably 
other more sensible things. But I wanted to try exploring sharding. Why would I do that when other, more reasonable and
lower effort, options available? ... Well, there are a lot of reasons:
- The biggest reason is because, I want to.
- I've never tried doing database sharding, so it'll be a good learning exercise.
- If Vitess is good enough for Youtube, then surely it's good enough for me... Right?

# What is Vitess?
Vitess is a system used for clustering MySQL database servers together. Vitess allows you to do a lot of really cool things.
But the main capability that I'm interested in is its ability to horizontally scale your MySQL DB using horizontal, or 
vertical, sharding with little to no modification of your application.

# Important note about what databases are support
Today, Vitess has support for MySQL and Percona.

Sorry, but there's no support for MariaDB. MariaDB support got dropped starting in v14 due to a number of issues 
(read this [heated discussion](https://github.com/vitessio/vitess/issues/9518) for more details). This doesn't really 
matter to me because I'll be using MySQL.

# Let's go!

----


## My environment
- OS: Windows 11 with Ubuntu on WSL2
- RAM/Memory: 32GB
- Kubernetes: I'm using k3d ([link](https://k3d.io)) to deploy a 3 node cluster locally 
  - 1x control plane node [master] - K3d calls these nodes "servers"
  - 2x regular nodes [workers] - K3d calls these "agents"
- Vitess deployment type: I used the Vitess Kubernetes Operator
- Vitess version: v20

## References and documentation:
- [Vitess v20 documentation](https://vitess.io/docs/20.0/)
- [Vitess operator schema spec](https://github.com/planetscale/vitess-operator/blob/e4992b7e512f76d9f221c9bd89735c88c2876006/docs/api/index.html)
- [Another reference for Vitess operator schema spec](https://github.com/planetscale/vitess-operator/blob/main/docs/api.md#planetscale.com/v2.VitessKeyspaceSpec)
- [Vitess blog post about VTAdmin](https://vitess.io/blog/2022-12-05-vtadmin-intro/)


## Vitess concepts
Before getting into the technical setup, there is some new Vitess specific terminology/concepts that we need to be aware
of, so we don't get confused. Later on when you're reading this guide, feel to come back here when there's a term being 
that you feel unfamiliar with. Please note that all of these definitions are directly copied from the Vitess 
documentation, but I may add in some more information when I feel it's necessary.
<details open>
  <summary>Terms and definitions:</summary>
    <ul>
      <li>
          <u><b>Cell</b></u>: A cell is a group of servers and network infrastructure collocated in an area, and 
          isolated from failures in other cells. It is typically either a full data center or a subset of a data center,
          sometimes called a <u>*zone*</u> or availability zone. Vitess gracefully handles cell-level failures, such as 
          when a cell is cut off the network.
          <br><br>
          Each cell in a Vitess implementation has a local topology service, which is hosted in that cell. The topology 
          service contains most of the information about the Vitess tablets in its cell. This enables a cell to be taken
          down and rebuilt as a unit.
          <br><br>
          Vitess limits cross-cell traffic for both data and metadata. While it may be useful to also have the ability 
          to route read traffic to individual cells, Vitess currently serves reads only from the local cell. Writes will
          go cross-cell when necessary, to wherever the primary for that shard resides.
          <br><br>
      </li>
      <li>
        <u><b>Cluster/VitessCluster</b></u>: This is the top-level attribute/interface in your Vitess k8s resource yaml 
        file, for configuring a cluster. Although the <code>VitessCluster</code> controller creates various secondary 
        objects like VitessCells, all the user-accessible configuration ultimately lives here. The other objects should 
        be considered read-only representations of subsets of the dynamic cluster status. For example, you can examine a
        specific VitessCell object to get more details on the status of that cell than are summarized in the 
        VitessCluster status, but any configuration changes should only be made in the VitessCluster object.
        <br><br>
        When you look at the Vitess Admin dashboard, you'll see your <code>VitessCluster</code> in the 
        <code>Clusters</code> page.
        <br><br>
      </li>
      <li>
        <u><b>Gate/VTGate</b></u>: A <code>Gate</code>, in the Vitess Admin dashboard, is a <code>VTGate</code>. A 
        VTGate is a lightweight proxy server that routes traffic to the correct VTTablet servers and returns 
        consolidated results back to the client. It speaks both the MySQL Protocol and the Vitess gRPC protocol. Thus, 
        your applications can connect to VTGate as if it is a MySQL Server.
        <br><br>
        When routing queries to the appropriate VTTablet servers, VTGate considers the sharding scheme, required latency
        and the availability of tables and their underlying MySQL instances.
        <br><br>
      </li>
      <li>
        <u><b>Keyspace</b></u>: A keyspace is a logical database. If you're using sharding, a keyspace maps to multiple 
        MySQL databases; if you're not using sharding, a keyspace maps directly to a MySQL database name. In either 
        case, a keyspace appears as a single database from the standpoint of the application.
        <br><br>
        Reading data from a keyspace is just like reading from a MySQL database. However, depending on the consistency 
        requirements of the read operation, Vitess might fetch the data from a primary database or from a replica. By 
        routing each query to the appropriate database, Vitess allows your code to be structured as if it were reading 
        from a single MySQL database.
        <br><br>
      </li>
      <li>
        <u><b>Schema/VSchema</b></u>: A VSchema allows you to describe how data is organized within keyspaces and 
        shards. This information is used for routing queries, and also during resharding operations. For a Keyspace, you
        can specify if it's sharded or not. For sharded keyspaces, you can specify the list of vindexes for each table. 
        Vitess also supports sequence generators that can be used to generate new ids that work like MySQL auto 
        increment columns. The VSchema allows you to associate table columns to sequence tables. If no value is 
        specified for such a column, then VTGate will know to use the sequence table to generate a new value for it.
        <br><br>
      </li>
      <li>
        <u><b>Tablet (VTTablet)</b></u>: A tablet is a combination of a mysqld process and a corresponding vttablet 
        process, usually running on the same machine. Each tablet is assigned a tablet type, which specifies what role 
        it currently performs. Queries are routed to a tablet via a VTGate server.
        <br><br>
        There are different Tablet types with different modes. For that imformation, please see this documentation: 
        [link](https://vitess.io/docs/20.0/concepts/tablet/#tablet-types)
        <br><br>
      </li>
      <li>
        <u><b>vtctlds</b></u>: vtctld is an HTTP server that lets you browse the information stored in the Topology 
        Service. It is useful for troubleshooting or for getting a high-level overview of the servers and their current 
        states. vtctld also acts as the server for vtctldclient connections.
        <br><br>
      </li>
    </ul>
</details>

# Environment Setup
## Step 0 - Dependencies
1. As a dependency, I'm expecting for you to already have `docker` installed and configured. Please reference Docker's 
  documentation for instructions on how to install docker for your specific Linux distribution.
2. Install [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/) and ensure it is in your PATH.
3. Install the [MySQL](https://dev.mysql.com/doc/mysql-getting-started/en/) client locally. Remember, you don't need the
  server. You only the client.
4. Install [vtctldclient](https://vitess.io/docs/get-started/local/#install-vitess) locally.

## Step 1 - Install & setup k3d
First, run the following command to install k3d:
`curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash`

Then we run k3d to setup a k8s cluster that has 1 master and two workers:
`k3d cluster create -a 2 -s 1`

## Step 2 - Install the Vitess Kubernetes Operator
Clone a copy of the vitess git repo:
```bash
git clone https://github.com/vitessio/vitess
cd vitess/examples/operator
git checkout release-20.0
```
Then install the operator:
```bash
kubectl apply -f operator.yaml
```

## Step 3 - Bring up an initial cluster
In this directory, you will see a group of yaml files/ The first digit ofeach filename indicates the phase of the 
example. The next two digits indicate the order in which to execute them. For example, `101_initial_cluster.yaml` is the
first file of the first phase.
<br><br>

I'll explain later what's going on in this file, but for now, just execute it:

```bash
kubectl apply -f 101_initial_cluster.yaml
```

### Step 3.1 - What's going on in the cluster creation yaml file?
At a high level here's what's being created:
- At the very top level, a new Vitess cluster (`VitessCluster`), named `example`, is being created. Everything else 
  being described are things being created within our cluster.
  - One `cell`, called `zone1` is being created. Vitess needs to associate resources within a cluster, to belong to a 
    `cell`. At a high level, you can think of a `cell` as kind of like an "availability zone". For a deeper explanation
    on what a `cell` is in Vitess, see the section [Vitess concepts](/vitess-getting-started/#vitess-concepts) in this 
    guide. 
    - Within out cell, the yaml will also create a single gateway (`vtgate`) and single user account based on the 
      information in the kubernetes secret `example-cluster-config`. It's important to note that this user account will
      effectively be your MySQL DB user account. What happens is that you'll use a MySQL client like `mysql`, a MySQL
      database driver, or MySQL Workbench to connect to your database (keyspace). The key thing to remember is that it's
      the gateway that's aware of the user account information, and it's also the gateway that knows the mapping of user
      accounts to their respective databases. So that also means that when you use your DB account credentials to
      connect and authenticate, you're authenticating with the gateway, not the MySQL DB directly.
  - With `vitessDashboard`, `vtctld` will be deployed into our cell (zone1). `vtctld` is an HTTP server that lets you 
    browse the information stored in the Topology Service. It is useful for troubleshooting or for getting a high-level 
    overview of the servers and their current states. 
    `vtctld` also acts as the server for `vtctldclient` connections.
  - With `vtadmin`, it provides both a web client and API for managing multiple Vitess clusters, and is the successor to 
    the now-deprecated UI for `vtctld`. `vtadmin` will get deployed into our `cell` called "zone1". The RBAC config that
    gets applied is defined in a kubernetes secret called `example-cluster-config`.
  - This is where things get interesting. With `keyspaces`,  we define the logical databases to deploy. In our case, we 
    are deploying a single keyspace (database) called "commerce". Within the keyspace attribute, we are deploying a few
    other things.
    - Within the keyspace, a single Vitess Orchestrator (`vtorc`) instance will be deployed. VTOrc is the automated
    fault detection and repair tool of Vitess. It started off as a fork of the
    [Orchestrator](https://github.com/openark/orchestrator), which was then custom-fitted to the Vitess use-case running
    as a Vitess component. An overview of the architecture of VTOrc can be found on this
    [page](https://vitess.io/docs/20.0/reference/vtorc/architecture). Setting up VTOrc lets you avoid performing the
    InitShardPrimary step. It automatically detects that the new shard doesn't have a primary and elects one for you.
  - With the `partitionings` attribute, we define a set of shards by dividing the keyspace into key ranges. Each field 
    is a different method of dividing the keyspace. Only one field should be set on a given partitioning.
    - Then with the `equal` attribute, we are saying that there are equal partitioning splits of the keyspace into some 
      number of equal parts, assuming that the keyspace IDs are uniformly distributed, for example because they’re 
      generated by a hash vindex.
      - `parts` is the number of equal parts to split the keyspace into. If you need shards that are not equal-sized, use 
        custom partitioning instead. Note that if the number of parts is not a power of 2, the key ranges will only be 
        roughly equal in size.
      - Within `shardTemplate` we specify our user-specified parts (options) of a VitessShard object.
        - `databaseInitScriptSecret` allows us to run a sql script at the time this shard initialized. This SQL script
          file, which is stored in a kubernetes secret, is executed immediately after bootstrapping an empty database to
          set up initial tables and other MySQL-level entities needed by Vitess.
        - `tabletPools` specify individual pools. A pool is a group of tablets in a given cell with a certain tablet 
          type and a shared configuration template, and are ideally all used for a similar purpose. There must be at 
          most one pool in this list for each (cell,type) pair. Each shard must have at least one “replica” pool (in at
          least one cell) in order to be able to serve. Within the tablet pool, we must define at least one pool. Each 
          pool must specify:
          - Which cell to be deployed into.
          - What type of pool it is. The allowed types are “replica” for master-eligible replicas that serve
            transactional (OLTP) workloads; and “rdonly” for master-ineligible replicas (can never be promoted to 
            master) that serve batch/analytical (OLAP) workloads.
          - The number of replica tablets to deploy in this pool. This field is required, although it may be set to 0, 
            which will scale the pool down to 0 tablets.
          - The vttablet configuration that should be used by all vttablets in the pool
          - The configuration of the locally running MySQL running inside each tablet Pod. You must specify either 
            Mysqld or ExternalDatastore, but not both.
          - And finally, `dataVolumeClaimTemplate` configures the PersistentVolumeClaims that will be created for each 
            tablet to store its database files. This field is required for local MySQL, but should be omitted in the 
            case of externally managed MySQL.
            <p>IMPORTANT: If your Kubernetes cluster is multi-zone, you must set a storageClassName here for a 
            StorageClass that’s configured to only provision volumes in the same zone as this tablet pool.</p>
        
        WARNING: DO NOT change the number of parts in a partitioning after deploying. That’s effectively deleting the 
        old partitioning and adding a new one, which can lead to downtime or data loss. Instead, add an additional 
        partitioning with the desired number of parts, perform a resharding migration, and then remove the old 
        partitioning. 

  - Finally, the `updateStrategy`. This specifies the strategy that the Vitess operator will use to perform updates of 
    components in the Vitess cluster when a revision is made to the VitessCluster spec. Supported options are:
    - External: Schedule updates on objects that should be updated, but wait for an external tool to release them by 
      adding the ‘rollout.planetscale.com/released’ annotation.
    - Immediate: Release updates to all cells, keyspaces, and shards as soon as the VitessCluster spec is changed. 
      Perform rolling restart of one tablet Pod per shard at a time, with automatic planned reparents whenever possible 
      to avoid master downtime.
    - IMPORTANT NOTE: the default is `External`


## Step 4 - Port forward Vitess services & populate commerce keyspace
```bash
# Port-forward vtctld, vtgate and vtadmin and apply schema and vschema
# VTAdmin's UI will be available at http://localhost:14000/
./pf.sh &
# Aliasing the main commands to avoid repeating common options
alias mysql="mysql -h 127.0.0.1 -P 15306 -u user"
alias vtctldclient="vtctldclient --server localhost:15999 --alsologtostderr"

# Apply schema and vschema
vtctldclient ApplySchema --sql="$(cat create_commerce_schema.sql)" commerce
vtctldclient ApplyVSchema --vschema="$(cat vschema_commerce_initial.json)" commerce

# Insert and verify data
mysql < ../common/insert_commerce_data.sql
mysql --table < ../common/select_commerce_data.sql
```

At this point now, we have a single keyspace called "commerce" with some data populated inside of it.

## Step 5 - Create second keyspace and migrate data
And at long last everyone, we get to see the cool stuff. This is where we create our second keyspace to move data into.
The second keyspace will be called `customer`.

Next, we'll be moving the tables `customer` and `corder` from the `commerce` keyspace into the in to the newly created 
`customer` keyspace.

The last major steps are that we validate the tables that were moved followed by redirecting all new read/write 
operations to our 
```bash
# Bring up customer keyspace
kubectl apply -f 201_customer_tablets.yaml

# Initiate move tables
vtctldclient MoveTables --workflow commerce2customer --target-keyspace customer create --source-keyspace commerce \
--tables "customer,corder"

# Validate
vtctldclient vdiff --workflow commerce2customer --target-keyspace customer create
vtctldclient vdiff --workflow commerce2customer --target-keyspace customer show last

# Cut-over
vtctldclient MoveTables --workflow commerce2customer --target-keyspace customer switchtraffic --tablet-types "rdonly,replica"
vtctldclient MoveTables --workflow commerce2customer --target-keyspace customer switchtraffic --tablet-types primary

# Clean-up
vtctldclient MoveTables --workflow commerce2customer --target-keyspace customer complete
```

## Step 6 - Resharding

(More to be added later...)