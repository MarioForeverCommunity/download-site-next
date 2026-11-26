An Android port of MF:CE, based on the open source code

* **[Download v2.2.2.6](https://file.marioforever.net/mario-forever/games/mobile-fangames/Meteo%20Dream/Mario%20Forever%20Community%20Edition%202.2.2.6%20Android.apk)** ([Mirror link on GitHub](https://github.com/KHwang9883/mf-community-edition/releases/download/v2.2.2.6/Mario.Forever.Community.Edition.2.2.2.6.Android.apk))

Source code: https://github.com/KHwang9883/mf-community-edition/tree/port/android

## v2.2.2.6 Changes

- Add save data import/export to the manage data menu
- Fixed a bug where triggering the console when paused can freeze the game
- Skip background auto-pause while a popup window is open
- Update Godot-TE to 4.7.3-rc4

## v2.2.2.5 Changes

- Add a SPEEDRUN STATS checkbox on the tweaks page: The stats overlay reuses the engine debug player speed script but no longer depends on --speedrun-stats.
- The game now supports deleting imported skin packs from the tweaks menu.
- Update Godot-TE to 4.7.3-rc3.

## v2.2.2.4 Changes

- Separate d-pad is now a toggle: a new `SEPARATE D-PAD` option under D-PAD. Off keeps the default compact d-pad; on lets each direction button be dragged on its own and remembers its layout. Turning it off restores the default arrangement, and turning it on again reuses the remembered layout.
- Hybrid mode shares the same d-pad anchor and separated layout with D-PAD.
- Auto-pause when the app goes to the background (focus loss, screen lock): the pause menu opens silently so timers and enemies stop running.
- Handheld orientation is set to sensor landscape.
- One confirm no longer triggers two stacked menus.
- Held input is cleared when a menu closes, so pressing A to close the pause menu no longer makes the player jump unexpectedly (this was introduced in v2.2.2.3).

## v2.2.2.3 Changes

- (Hotfix) Fixed skin import not working (by recompiling with Godot-TE 4.7.3-rc2)
- Keep virtual buttons unreleased while loading or respawning
- Fixed a bug where pressing virtual buttons triggers both the touch button and whatever is below it
- Lock the options camera since some settings are disabled

## v2.2.2.2 Changes

- Fixed a bug where the player would continue moving in the direction of a held joystick after respawning when using Stick or Hybrid movement input.

## v2.2.2.1 Changes

- The EXTRA button now also supports pressing UP + EXTRA to access the Expert Shop.
- The console now works and can be triggered by the virtual F1 button
- The controls menu has been moved from TWEAKS to OPTIONS, and it can now be accessed while the game is paused.
- Added a new control layout mode that allows the four directional buttons to be positioned separately.
- Kevin Mode can now be activated by tapping the block directly, even if it was not ever activated.
- Added TAB/DEL virtual buttons
- Bonus levels can be entered with the EXTRA button, and optimized touch detection for tapping stars.

## v2.2.2 Changes

- Added virtual buttons, with 3 input modes (dpad/stick/hybrid)
- Fixed external controller support
- Added support for the Android back button, enabling functions such as triggering the pause menu or going back to the previous screen
- Skin zip importer with manifest validation and progress overlay
- Support star minigame touch clicks
- Enable autorun tweak by default
- Added touch settings in tweaks
- Disabled certain settings exclusive to desktop platforms
- Integrated an Android build of [godot-openmpt](https://github.com/Thunder-Engine-Dev/godot-openmpt) extension
- Removed the proprietary libleaderboards extension

## Note

- The initial release was built using an Android export template for Godot-TE that I compiled. Since v2.2.2.3 hotfix, the [export template compiled by CI](https://github.com/Thunder-Engine-Dev/godot-thunder) is used.
- Arm32 & arm64 devices are supported.
