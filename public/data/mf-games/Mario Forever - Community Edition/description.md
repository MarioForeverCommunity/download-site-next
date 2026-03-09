# Mario Forever: Community Edition

Game website: [https://mfce.rnx.su](https://mfce.rnx.su)
Other Mario Forever games made by the team: [https://rnx.su/s/MeteoDream?dir=/Games](https://rnx.su/s/MeteoDream?dir=/Games)

## Installation

To install it, just extract it anywhere. Your save data is stored in a different location on your computer.

If you are updating the game, you can extract to the same location as the previous version, replacing the files.

If you want to inspect your **save files**, locate to the following directory:

> %appdata%\\MeteoDream\\Mario Forever Community Edition

Before version 2.0.0, the save data location was different. The following location is used for saving in versions 1.0 and 1.1:

> %appdata%\\Redot\\app\_userdata\\Mario Forever- Community Edition

Please note that when upgrading from 1.0 or 1.1 to 2.0.0 or up, all your data is automatically copied over from the old location to be used in the newer version. This happens if the game could not detect the folder in `%appdata%\MeteoDream`. No action from the user is required when upgrading.

The only files related to your game progress are files in `thss` extension and the `saves` folder.

## Troubleshooting

If your graphics card does not support Vulkan or the game otherwise does not run properly by launching the executable, first, try updating the graphics drivers. Most problems are solved just by updating the drivers on your computer.

If updating the drivers did not help and the game still displays incorrectly or crashes on startup, try running the batch file included with the game named `01. Launch in Compatibility Mode.bat`. This will force the game to run in Compatibility renderer (OpenGL). Alternatively, you can try `02. Launch in Compatibility Mode (angle).bat`, which forces the game to run in Direct3D 11 compatibility renderer.

Please note, that Compatibility Mode is not a recommended way to play and we don't take any responsibility for any visual bugs or glitches that may occur during playthrough.

If the game is occasionally stuttering on Windows during gameplay, you can try setting CPU priority of the game to "Above Normal" or "High" in task manager. If you don't know how to do it, google it.

If you're having microstutters during gameplay, you can try setting VSync in options to 3x Buffer and then restarting the game when prompted. Note that triple buffering increases input lag, but it shouldn't be a problem for high refresh rate displays. Windows 10 is known for causing microstutters in windowed mode; upgrading to Windows 11 23H2 can eliminate this problem.

## System Requirements

**Minimum**:

-   **OS**: Windows 7 x64 / Linux x64
-   **CPU**: Any x86-64
-   **RAM**: 2 GB
-   **GPU**: Integrated graphics with full OpenGL 3.3 support
-   **Storage**: at least 350 MB of free storage space

**Recommended**:

-   **OS**: Windows 11 x64 build 23H2 / Linux x64
-   **CPU**: Any x86-64
-   **RAM**: 4 GB
-   **GPU**: Dedicated graphics with full Vulkan 1.2 support
-   **Storage**: at least 400 MB of free storage space

Linux build has been tested on Ubuntu 24.04.
