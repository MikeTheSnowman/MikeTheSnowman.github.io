---
slug: LineageOS-22_2-Samsung-S20-FE-5G
title: Installing LineageOS 22.2 on Samsung S20 FE 5G (SM-G781B)
date: 2025-06-24T01:00:00.000Z
excerpt: The topic is in the title. But also, this is actually part-1 in my journey to trying to use my phone as a Klipper host to control my 3D printer
coverImage: /images/posts/lineageos/LineageOS_Logo.png
tags:
  - Guide
---

# Motivation
A few months back, I got lucky and scored a free 3D printer from one of god's favorite children of Facebook Marketplace. I got so lucky that the printer was a Prusa MK3S+ 3D printer. When I got it, the only thing that was "broken" was a clogged nozzle then BAM! I've got a working printer! 
Now, the MK3S+ is a great and reliable printer, but I really wanted to run Klipper because, with a bit more modding, I'd be able to do things like input shaping which could greatly inprove the quality of my prints and possibly speed up my prints too without sacrificing quality.
In order to run Klipper, you need an external system to act as the "host" which will send the gcode to an MCU running the Klipper firmware.
Typically the host is a single board computer (SBC) like a Raspberry PI, buuut...
- I don't have one of those
- They're expensive
- I'd still need to purchase some other things like a touchscreen, lights, etc.

Reading through documentation and forum posts, it came up that an old Android phone could potentially be repurposed to be the Klipper host. I think this is a fantastic idea for several reasons:
- I already have a few old Android phones
- I don't need to purchase a new SBC
- Phones already have high quality touchscreen displays
- Built-in:
  - WiFi
  - 4G/5G modem
  - Bluetooth
  - USB-C
  - Wireless charging
  - Quality front & rear cameras
  - Battery
  - Large internal storage (for me, 128GB)
  - Multi-core CPU
  - Sufficient RAM (for me, 8GB)

# Why use LineageOS?
Samsung's One UI is a bit bloated and I wanted to try and squeeze as much performance out of my old phone as possible. Because of that, I made the decision to use a different ROM that would be more lean and I also wanted something that had a good chance at possibly getting some more updates in the future. With that, I ultimately landed on the decision to use LineageOS.

# What the game plan?
- Part 1: That's what this blog post is going to be about. It will be about documenting the process I took to get my phone rooted with LineageOS installed.
- Part 2: The next blog post will be me trying to get Klipper and Moonrake installed on my phone and connected to my printer.

# One more important note!
The **MAJORITY** of the instructions in this blog post came from LineageOS's website. I've modified portions of the documentation to provide updated links to files that were not accessible from the original documentation or I have adjusted portions of the documentation to reflect exactly what I did.

## My environment
- Workstation details:
  - OS: Windows 11
  - RAM/Memory: 32GB
- Phone details:
  - Model number: SM-G781B
  - CPU model: Qualcomm SM8250 Snapdragon 865 5G
  - OS: Samsung One UI 5 (Android 13)

> ⚠️ Warning:
>
> The provided instructions are for LineageOS 21. These will only work if you follow every section and step precisely. 
> Do **not** continue after something fails!

# Let's go!
----

## Step 1: Basic requirements
1. Read through the instructions at least once before actually following them, so as to avoid any problems due to any missed steps!
2. Make sure your computer has <span style="color:#e91e63; font-weight:bold">adb</span> and <span style="color:#e91e63; font-weight:bold">fastboot</span>. Setup instructions can be found [here](https://wiki.lineageos.org/adb_fastboot_guide.html#installing-adb-and-fastboot).
3. Enable [USB debugging](https://wiki.lineageos.org/adb_fastboot_guide.html#setting-up-adb) on your device.
4. Make sure that your model number is one of the following (exact match required!):
    - SM-G781B
    - SM-G781B/DS
5. Boot your device with the stock OS at least once and check every functionality.
6. Remove all Google accounts from your device to avoid "Factory reset protection"
7. LineageOS is provided as-is with no warranty. While we attempt to verify [everything works](https://github.com/LineageOS/charter/blob/main/device-support-requirements.md) you are installing this at your own risk!

> ⚠️ Warning:
>
> Your device needs a specific [firmware](https://wiki.lineageos.org/glossary#firmware) version before proceeding.
> If your device is currently using a newer or older version than the required version, please up- or downgrade to the required version before proceeding with your LineageOS installation.
> The required version is **Android 13**, which may be lower than the LineageOS version you are about to install - this is not an error!
> If there are multiple updates of that version (e.g. security updates), make sure to use the latest!
> If you need to upgrade or downgrade your device, please search online for guides.
> We are unable to provide specific instructions here and on our support platforms.

## Step 2: Checking the correct firmware
Installation on your device requires a specific [firmware](https://wiki.lineageos.org/glossary/#firmware) version to be installed before you continue.

- Firmware refers to a device-specific set of images that are included in, and updated by the stock OS
- LineageOS builds for this device require an **Android 13** version of the [stock OS](https://wiki.lineageos.org/glossary/#stock-rom) to be installed prior to following the installation guide
- Please ensure that you are checking the **Android** version, and not the vendor OS version
- Being on another custom ROM, including unofficial builds of the same version of LineageOS, does not ensure that this requirement has been fulfilled
- Please re-read this section as many times as necessary to fully understand the requirements

> ℹ️ Note: 
> If you are unsure what firmware version you are currently on, we strongly recommend returning to the corresponding stock OS before following the installation guide!

Failing to install the correct firmware version prior to installation may result in failure to install LineageOS, unexpected crashes post-installation, or permanent damage to your device!

> ℹ️ Note: 
> For getting a copy of the stock OS, you can down load one from here, but please note that it requires an (free) account registration: https://www.sammobile.com/samsung/galaxy-s20-fe/firmware/SM-G781B/XSA/

## Step 3: Pre-Install Instructions
> ⚠️ Warning: The following instructions will unlock the bootloader and wipe all userdata on the device.

1. Connect the device to a Wi-Fi network.
2. Enable Developer Options by pressing the "Build Number" option at least 7 times, in the "Settings" app within the "About" menu
    - From within the Developer options menu, enable OEM unlock.
3. Download <span style="color:#e91e63; font-weight:bold"></span> vbmeta.img from [here](https://github.com/ata-kaner/r8q_archive/releases/tag/vbmeta).
    - NOTE: There is another one posted on XDA [here](https://xdaforums.com/t/rom-13-0-unofficial-snapdragon-crdroid-for-samsung-galaxy-s20-fe-4g-5g.4646714/post-89252291), but I personally haven't tried testing it
4. Power off the device, and boot it into download mode:
    - With the device powered off, hold `Volume Up` + `Volume Down` and connect USB cable to PC.
    - Now, click the button that the onscreen instructions correlate to "Device unlock mode" and/or "Unlock Bootloader".
    - Device will restart, repeat steps 1 and 2 to enable the Developer Options menu again.
    - Verify that "OEM Unlock" is still enabled and continue to step 6
5. Download and install the necessary drivers.
    - Download the newest Samsung drivers from [here](https://developer.samsung.com/mobile/android-usb-driver.html).
    - Install `SAMSUNG_USB_Driver_for_Mobile_Phones.exe`.
6. Download [this](https://undocumented.software/Odin_3.13.1.zip) version of Odin.
7. Extract "Odin_3.13.1.zip".
8. Run <span style="color:#e91e63; font-weight:bold">Odin3 v3.13.1</span> found in the newly extracted "Odin_3.13.1" folder.
9. Check the box labeled next to the button labeled "AP", and then click the "AP" button.
    - In the menu that pops up, select the previously downloaded <span style="color:#e91e63; font-weight:bold">vbmeta.tar</span> file.
10. Power off the device, and again boot it into download mode:
    - With the device powered off, hold `Volume Up` + `Volume Down` and connect USB cable to PC.
11. Check in the top left of the Odin window that you see a valid device, it will show up as something like <span style="color:#e91e63; font-weight:bold">COM0</span>.

> ✅ Tip: The COM port, or the number succeeding COM, may be any valid number.

12. Click "Start". A transfer bar will appear on the device showing the VBMeta image being flashed.
13. Your device will reboot, you may now unplug the USB cable from your device.
14. The device will demand you factory reset, please follow the onscreen instructions to do so.
15. Run through Android Setup skipping everything you can, then connect the device to a Wi-Fi network.
16. Re-enable Development settings by clicking the "Build Number" option 10 times, in the "Settings" app within the "About" menu, and verify that "OEM Unlock" is still enabled in the "Developer options" menu.

## Step 4: Important Information
> ℹ️ Note: The following instructions require a machine running Windows 10 build 17063 or newer.

Samsung devices come with a unique boot mode called "Download mode", which is very similar to "Fastboot mode" on some devices with unlocked bootloaders. Odin is a Samsung-made tool for interfacing with Download mode on Samsung devices. The preferred method of installing a custom recovery is through Download Mode – rooting the stock firmware is neither necessary nor required.

## Step 5: Installing Lineage Recovery using <span style="color:#e91e63; font-weight:bold">Odin</span>

> ℹ️ Note: If this device’s install instructions already had you download Odin/Enable OEM Unlocking earlier in the installation process, you can skip the steps for enabling OEM Unlock, as well as for downloading and extracting the drivers and Odin.

1. Enable Developer Options by pressing the "Build Number" option 10 times, in the "Settings" app within the "About" menu
    - From within the Developer options menu, enable OEM unlock.
2. Download the LineageOS 22.2 <span style="color:#e91e63; font-weight:bold">ROM</span> ([link](https://pixeldrain.com/u/YLdQ4ZMz)) and <span style="color:#e91e63; font-weight:bold">recovery</span> ([link](https://pixeldrain.com/u/bG5kQ52S)) images.
    - NOTE: The download links for this step came from [this](https://xdaforums.com/t/rom-15-unofficial-stable-lineageos-22-2-for-samsung-galaxy-s20-fe-4g-5g-snapdragon-14-04-2025.4669975/) XDA post.

> ⚠️ Important: Other recoveries may not work for installation or updates. We strongly recommend to use the one linked above!

3. Power off the device, and boot it into download mode:
    - With the device powered off, hold `Volume Up` + `Volume Down` and connect USB cable to PC.
    - Now, click the button that the onscreen instructions correlate to "Continue", and insert the USB cable into the device.
4. Download and install the necessary drivers.
    - Download the newest Samsung drivers from [here](https://developer.samsung.com/mobile/android-usb-driver.html).
    - Install `SAMSUNG_USB_Driver_for_Mobile_Phones.exe`.
5. Download [this](https://undocumented.software/Odin_3.13.1.zip) version of Odin.
6. Extract "Odin_3.13.1.zip".
7. Run <span style="color:#e91e63; font-weight:bold">Odin3 v3.13.1</span> found in the newly extracted "Odin_3.13.1" folder.
8. Check in the top left of the Odin window that you see a valid device, it will show up as something like <span style="color:#e91e63; font-weight:bold">COM0</span>.

> ✅ Tip: The COM port, or the number succeeding COM, may be any valid number.

9. In the left side of the Odin window, you will see an "Options" tab, click it, and then un-check the "Auto Reboot" option.
10. Check the box labeled next to the button labeled "AP", and then click the "AP" button.
    - In the menu that pops up, select the <span style="color:#e91e63; font-weight:bold">recovery</span> image that was downloaded in step 2.
11. Click "Start". A transfer bar will appear on the device showing the recovery image being flashed.

> ℹ️ Note: The device will continue to display `Downloading... Do not turn off target!!` even after the process is complete.

12. Manually reboot into recovery, this may require pulling the device’s battery out and putting it back in, or if you have a non-removable battery, press the Volume Down + Power buttons for 8~10 seconds until the screen turns black & release the buttons immediately when it does, then boot to recovery:
    - With the device powered off, hold `Volume Up` + `Power` while the device is connected to a PC via USB cable.

> ℹ️ Note: Be sure to reboot into recovery immediately after installing the custom recovery. If you don’t the custom recovery will be overwritten on boot.

> ℹ️ Note: If your recovery does not show the LineageOS logo, you accidentally booted into the wrong recovery. Please start at the top of this section!

## Step 6: Installing LineageOS from recovery
1. Download the ROM from [here](https://pixeldrain.com/u/YLdQ4ZMz).
2. If you are not in recovery, reboot into recovery:
    - With the device powered off, hold `Volume Up` + `Powe`r while the device is connected to a PC via USB cable.
3. Now tap **Factory Reset**, then **Format data / factory reset** and continue with the formatting process. This will remove encryption and delete all files stored in the internal storage, as well as format your cache partition (if you have one).
4. Return to the main menu.
5. Sideload the LineageOS ROM .zip package **but do not reboot to system** before you read/followed the rest of the instructions!
    - On the device, select "Apply Update", then "Apply from ADB" to begin sideload.
    - On the host machine, sideload the package using: `adb -d sideload filename.zip`

> ✅ Tip: Normally, adb will report `Total xfer: 1.00x`, but in some cases, even if the process succeeds the output will stop at 47% and report `adb: failed to read command: Success`. In some cases it will report adb: failed to read command: No error or `adb: failed to read command: Undefined error: 0` which is also fine.

## Step 7: Installing Add-Ons
> ⚠️ Warning: If you want to install Google Apps add-on package (use the `arm64` architecture), you can download it from [here](https://wiki.lineageos.org/gapps/#mobile). This add-on needs to be installed **before** booting into LineageOS for the first time!

1. Click <span style="color:#e91e63; font-weight:bold">Apply Update</span>, then <span style="color:#e91e63; font-weight:bold">Apply from ADB</span>, then `adb -d sideload filename.zip` for all desired packages in sequence. When presented with a screen that says <span style="color:#e91e63; font-weight:bold">Signature verification failed</span>, click <span style="color:#e91e63; font-weight:bold">Yes</span>. It is expected as add-ons aren’t signed with LineageOS’s official key!
2. Repeat the previous step for installing **magisk** (used for root access on the phone), which is available [here](https://github.com/topjohnwu/magisk/releases/).

## Step 8: All set!
Once you have installed everything successfully, you can now reboot your device into the OS for the first time!

- Click the back arrow in the top left of the screen, then <span style="color:#e91e63; font-weight:bold">Reboot system now</span>.

> ℹ️ Note: The first boot usually takes no longer than 15 minutes, depending on the device. If it takes longer, you may have missed a step, otherwise feel free to get assistance.

<div style="margin-top:50px"/>

# Conclusion
That wraps things up for this blog post. 
By my estimate, I'm about half way done to getting Klipper running on my phone to start controlling my 3D printer. When I do get that last part working, I'll make a follow up post. When I do, I'll update this blog post with the link to the next part.