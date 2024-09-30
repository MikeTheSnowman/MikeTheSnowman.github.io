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
- [Vitess operator schema spec](https://github.com/planetscale/vitess-operator/blob/main/docs/api.md#planetscale.com/v2.VitessKeyspaceSpec)
- [Vitess blog post about VTAdmin](https://vitess.io/blog/2022-12-05-vtadmin-intro/)


## Key Vitess concepts
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
    on what a `cell` is in Vitess, see the section `Key Vitess concepts` in this guide.
  - With `vitessDashboard`, `vtctld` will be deployed into our cell (zone1). `vtctld` is an HTTP server that lets you 
    browse the information stored in the Topology Service. It is useful for troubleshooting or for getting a high-level 
    overview of the servers and their current states. 
    `vtctld` also acts as the server for `vtctldclient` connections.
  - With `vtadmin`, it provides both a web client and API for managing multiple Vitess clusters, and is the successor to 
    the now-deprecated UI for vtctld. `vtadmin` will get deployed into our `cell` called "zone1".
  - With `keyspaces`,  we define the logical databases to deploy. In our case, we are deploying a single keyspace into
    our cell, zone1, with just a single partition that has two replicas.

(More to be added later...)