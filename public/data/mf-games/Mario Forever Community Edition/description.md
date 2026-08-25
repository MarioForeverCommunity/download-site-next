# Mario Forever: Community Edition

Play the upgraded classic again!
Mario Forever makes a return with a more polished look, flexible settings, and new custom elements! Created on Thunder Engine, Mario Forever - Community Edition aims to bring both the classic feel of the game and a lot of quality of life features and cosmetics, not seen before, to the game.

Licensed under BSD 3-Clause License: https://github.com/meteo-dream/mf-community-edition
Game website: https://mfce.rnx.su
Other Mario Forever games made by the team: https://nx.wtf/s/aVtZ?path=Games
Soundtrack: https://nx.wtf/s/aVtZ?path=Music
Join Cloud Lounge Discord server: https://mfce.rnx.su/discord

## Installation

To install it, just extract it anywhere. Your save data is stored in a different location on your computer.

If you are updating the game, you can extract to the same location as the previous version, replacing the files.

If you want to inspect your **save files**, locate to the following directory:

> %appdata%\MeteoDream\Mario Forever Community Edition

The only files related to your game progress are files in `thss` extension and the `saves` folder.

## Troubleshooting

If your graphics card does not support D3D12 or Vulkan or the game otherwise does not run properly by launching the executable, first, try updating the graphics drivers. Most problems are solved just by updating the drivers on your computer.

If updating the drivers did not help and the game still displays incorrectly or crashes on startup, try running the bat files included with the game with names starting with `Launch in ... Mode`. If one did not solve the issues, try the next bat file. For versions before 2.2.0, Vulkan renderer was used by default, so if the game ran fine in previous versions, try launching `01. Launch in Alternative Mode (Vulkan)`.

Please note, that Compatibility Mode (OpenGL 3.3 and ANGLE) is not a recommended way to play and we don't take any responsibility for any visual bugs or glitches that may occur during playthrough.

If the game is occasionally stuttering on Windows during gameplay, you can try setting CPU priority of the game to "Above Normal" or "High" in task manager. If you don't know how to do it, google it.

If you're having microstutters during gameplay, make sure you have VSync enabled in the game options. If you are still having microstutters on 2x Buffer, you can try setting VSync to 3x Buffer. Note that triple buffering increases input lag, but it shouldn't be a problem for high refresh rate displays. Windows 10 is known for causing microstutters in windowed mode; upgrading to Windows 11 or pressing F11 to switch the game to use Fullscreen Mode can eliminate this problem.

## System Requirements

**Minimum**:

- **OS**: Windows 10 x64 / Linux x64
- **CPU**: Any x86-64 with SSE4.2 support
- **RAM**: 3 GB
- **GPU**: Integrated graphics with full OpenGL 3.3 support
- **Storage**: at least 450 MB of free storage space

**Recommended**:

- **OS**: Windows 11 x64 build 23H2 / Linux x64
- **CPU**: Any x86-64 with SSE4.2 support
- **RAM**: 4 GB
- **GPU**: Dedicated graphics with full Vulkan 1.2 support or full Direct3D 12 support
- **Storage**: at least 450 MB of free storage space

Linux build has been tested on Ubuntu 24.04.

## Credits

Game developed by Meteo Dream.
Original game by Michał Gdaniec (Buziol Games).
Software used: Godot Engine.

**List of contributors to the game:**
- JUE13, ReflexGURU, 马里奥X7 (Yukana), CoreSHINOBI124, Heavenice, SerafimGWS, Bullex738, Yaolinggui, LooPeR231, Nerton17, Jeansowaty, SuperMany
**Graphics:**
- SerafimGWS, SuperMany, Bullex738, Jeansowaty, PlayerGuy, Zik The Green, Nerton17, Heavenice, S.Koopa0, Anaswael, SuperSledgeBro, Crystalika, Sednaiur, GlacialSiren484, Valtteri, Leany, Can't Sleep
**Testing and Feedback:**
- SoundWave961, Master48, miyameon, Can't Sleep, Zik The Green, Polivoz72, Niikes, RafaelVitoria, nekohash9, Kavex
**Special Thanks:**
- Syzxchulun, Lyh, LongZongKuiYan, HappyLee_12, Anding7, similarFANA, OnceBeta, 风华正茂999999, nmnmoooh, WSW, Maurycy Zarzycki, Maurice Guegan, CasperTheMarioForeverFan, OmerAras55, Newlife2017, Muqriblue, LinkyTay, MFBoy, TwoSpacesSG, Lu9, Seby Bab


# MFCE Update Change Log

## Version 2.2.1

Released on August 17th, 2026.

### Additions:
- The bundled Skin Editor has been completely overhauled, gaining new features and drastically improving on existing ones. Editing skins has never been this easy before!
- Added a new Skin Suit Tweak: `frog_restart_swim_on_direction_change` - when true, changing directions while swimming in the Frog Suit restarts the animation.
- Added "Master" volume slider to options - an independent slider that affects both Sound and Music.

### Changes:
- The bundled Revamped Mario skin now has new frog suit swimming animations.
- The "Revamp level design of some levels" tweak's description now lists what levels it affects.
- The last level of Human Lab 2 now credits people who worked on level design for the world.
- F3 and F4 shortcut keys now work even if they would restart the same scene.
- Skin Test Room now requires to press Escape (or whatever is mapped to Menu Back) to exit it, instead of Save Delete key.
- The background for Syzxchulun's World 13-3 (second part) has been slightly changed.
- The background for Syzxchulun's World 12-3 is now parallaxed.

### Removals:
- The Expert Mode with Kevin message warning has been removed, since it has been proven possible to complete.
- Removed fake water from the second section of 1-1's bonus room, since it could be confusing for some people.

### Fixes:
- Fixed a bug where Mario Minix would not add a record to the leaderboard if you had 0 godlikes.
- Fixed being unable to achieve 100% completion of the game.
- Fixed World U pipe labels not showing up in correct colors.
- Fixed Syzxchulun's World 13 map music not looping.
- Fixed a bug in Expert 7-3 where Big Bertha would not kill the player in some cases.
- Fixed a bug in World 8-4 where the player could walk during the Princess Toadstool rescue cutscene and potentially die out of bounds.
- Fixed a crash that could occur when rapidly changing between scenes.
- Fixed some timers being inconsistent.
- Fixed a bug in Syzxchulun's World 9-4 where the fog would display above the HUD.
- Fixed a miscredit for Rock537 in Human Lab 2.
- Fixed a bug in Squario worlds where clouds in Maximum quality would not have lights behind them.
- Fixed a bug in World U-3 where changing settings or toggling fullscreen could make the level appear darker when outside.
- Fixed a bug in World U-X where one of the blocks would not disappear with Small Suit.
- Fixed a bug where resetting achievement data with console tweak enabled could lock you out of getting any achievement, unless tweaks are also reset.
- Fixed an animation glitch with cloud face in Human Lab 2.
- Fixed minor parallax background glitches in some levels of Human Lab 2.
- Fixed a bug in Minimum quality where some clones would not rotate on death.
- Fixed pops, clicks, and noise in a few sound effects.
- Fixed some sound effects having low bitrate.
- Fixed doubled power-up blocks in improved Worlds 10-2 and 13-3.
- Minor fixes with Bullet Bill Launcher graphics in a few levels.
- Fixed some cutscenes in Kevin Mode missing Kevin.
- Fixed inconsistent timings for attacks in a Human Lab 2 boss battle.
- Fixed some human clones using old sprites on maps.
- Fixed a bug where Kevin would sink in the ground by 1 pixel.
- Fixed a bug in World 1-1 where falling into a pit in the bonus room could produce water splash, despite there being no water.
- Fixed the Flash World 2-3 cutscene being unskippable.
- Fixed the Skin Setup screen having no "offset" property for Emit Particles, requiring to change the file through notepad to access the property.
- Fixed a bug in Advance Worlds 10-2 and 12-3, where the levels would ignore the warning tweak and always start with improved level design.
- Fixed a softlock with doors in toad houses, when crossfade tweak is disabled.
- Fixed a bug where circle transitions could get stuck mid-closing by pressing F3/F4 shortcut keys.
- Fixed the default Revamped Mario skin having broken slide animation loop for Super Mario and up.
- Fixes regarding the Frog Suit skin:
- - `look_up` now works with Frog Suit correctly.
- - Hopping now plays the walk animation once per hop.
- - `hold_swim` plays animations properly now.
- - Hopping does no longer make the walk animation's first frame flicker for 1 tick.
- - Interrupting hopping with animations like `kick` does no longer break the hopping animation.
- Fixed Lakitu and Cloud Platform graphics having transparent pixels.
- Fixed a memory leak with question blocks, triggered by entering Skin Test Room or enabling `cv_items` cheat.
- Fixed a bug where pressing F3/F4 would break ongoing circle transitions.
- Fixed a minor desync bug with blinking text in settings.
- Fixed a bug where the Frog Suit would be stuck on one frame on map and in progress continue screen.
- Fixed the Soundtrack button in main menu leading to a dead link.
- Fixed the Human Lab 2 boss attack projectiles having incorrect death effects.
- Fixed an issue with the map graphic in Maximum quality main menu.
- Fixed a bug where a suspended progress was not deleted after completing World U.
- Fixed a bug where Syzxchulun's World 12-3 had no blur transition on the exit pipe.


## Version 2.2.0

Released on August 8th, 2026.

### Additions:
- Added Human Laboratory 2 by Meteo Dream.
- Added Squario Worlds - a port of a Flash game with the same name.
- Added World U by nmnmoooh, with 3 difficulties to choose from.
- Added Syzxchulun's World 13.
- Added Syzxchulun's World 13 Advance Edition.
- Added Syzxchulun's World 12 Advance Edition.
- Added some hidden levels.
- Added more achievements to the achievement board.
- Save Game Room / Kevin Mode:
- - More extra worlds and levels can now show purple Kevin labels.
- - Added a Kevin death counter in Save Game Room, and a "deaths completed" counter for Kevin Mode.
- - - Save pipes before this update are unaffected.
- - Completed save pipes now show "cleared ..." text (warpless, no hit, no death).
- - Added an achievement paginator in the Save Game Room.
- Mario Minix:
- - Added unique music for the "Mario Play" map.
- Added a unique checkpoint activation effect on Maximum quality.
- Skin system:
- - Added global sounds `p_switch_activate`, `bonus_stopwatch`, and `enemy_freeze`, plus a `stopwatch_sound_delay_sec` global skin tweak.
- - Custom checkpoint image for Maximum quality can be set with `checkpoint_max.png`.
- Console cheats:
- - Added `setgravity`, `setplayerrotation`, and `cv_shownames` commands.
- - Text completion on Tab / Shift+Tab has been improved, with options now being displayed.
- Added a suspicious cloud above the Human Lab 2 pipe.
- And many more little things not listed here.

### Changes:
- Player physics have been adjusted to feel closer to Cloud Engine / original Mario Forever (walk/run speeds, jump height, crouch-jump consistency, fireball speed, and several enemy speeds).
- Big Mario and Frog Suit hitboxes are now shorter.
- Lava heat effect has been enhanced.
- Snow Roto-discs now work with jump buffer and are easier to see.
- Made some corrections in the Harder Story Mode level design tweak.
- Checkpoint effect on Medium quality has been changed to be more similar to MF v4.4.
- BTE worlds label text has been updated in save room.
- Cave cutscenes can now be skipped with the jump button.
- Syzxchulun World 9 (regular) now has a unique map music.
- Ice blocks are less fragile when thrown.
- Game audio is now muted when the window is minimized.
- Credits updated: Bullex (level remaking), Nerton (GFX), and Valtteri (Squario GFX).
- On Windows, the game is now using D3D12 renderer by default. You can choose to use Vulkan renderer back by launching the included bat files.
- The game now requires the SSE4.2 CPU instruction set to run.
- Windows: The game does no longer support Windows 7. Upgrade to Windows 10 or 11 for the game to work.

### Removals:
- Removed the Modloader.
- Removed the frog suit from World 7-2.
- Removed the BTE Kevin achievement from the board. (It still changes the world name's color in save room.)

### Fixes:
- Fixed a lot of jittering problems, including platforms, autoscroll, shaking tank ground, and more.
- Fixed shells getting stuck in blocks.
- Fixed enemy stomping being way too lenient.
- Fixed Buzzy Beetle shells not killing each other properly.
- Fixed the player sometimes skipping gaps in walls when falling.
- Fixed suspended progress being skipped in Devastator and Human Lab Tower.
- Fixed suspended profile deletion on world completion for BTE World 9, Syzxchulun worlds, and Christmas Laboratory.
- Fixed life counter resetting when continuing progress.
- Fixed Retro Scroll Challenge issues, including previously impossible levels, the 6-4 maze and Expert 4-3.
- Fixed broken circle transitions on some Save Game Room warps.
- Fixed Princess Toadstool sprites and animations.
- Fixed Expert Mode intro cutscene missing piranha plants.
- Fixed some bullet bill launcher graphics (including upside-down ones).
- Fixed upward spikes in Expert 8-4 dealing damage from the sides.
- Fixed joypad input still being read while the window is unfocused.
- Fixed "game saved" tweak popup appearing when it shouldn't.
- Fixed starting cutscenes not being skippable with Esc.
- Fixed water with no collision having no splash effects (e.g. World 2-3).
- Fixed an exploit in Devastator.
- Fixed completed Story Mode saves incorrectly modifying warped/died/damaged flags.
- Fixed minor graphical mistakes, misaligned objects, and layering errors in many places.
- Fixed Thwomps sometimes being left in the "restoring" state forever in certain cases.
- Fixed ice flower memory leaks, stuttering, and wrong ice sprite layering.
- Fixed gravity bodies incorrectly keeping speed after leaving platforms.
- Fixed enemies losing speed on corner correction.
- Fixed a bug where bumping into a wall would cause the player to stand in place during the level finish sequence.
- Fixed unreliable antistuck with question blocks.
- Fixed a bug where Frog Suit animation would flicker when swimming.
- Fixed Hammer Bros. sometimes permanently stopping throwing projectiles.
- Fixed a bug where dots on map would sometimes be delayed on fast-forward.
- Fixed several thwomp / chilly thwomp / piranha / paratroopa / wing animation and collision issues.
- Fixed 1-tick sound delay.
- And many more fixes.

# Version 2.1.3

Released on January 31st, 2026.

### Changes:
- The "Frozen Castle" Minix map is now easier.
- The "Christmas Laboratory Completed" achievement is now visible on the achievements table (on page 2).

### Fixes:
- Fixed MF Flash 3-4 completion leading to a black screen.
- Fixed a bug where the Atom Replenisher item did not account for custom skin sound.
- Fixed "Open Documentation" button in Skin Setup having a dead link.
- Fixed a bug where the `pitch_music_everywhere` hidden tweak required a deprecated `copyright_free_ost` to be enabled.

# Version 2.1.2

Released on January 27th, 2026.

All versions released prior have a non-functional Update Checker now, unfortunately.

### Additions:
- Added 2 new maps to Mario Minix: Overwater and Frozen Castle.
- - The "100,000 score in all Minix maps" now accounts for these new maps too, but if you already have this achievement unlocked, it will stay unlocked even after updating.

### Changes:
- Improved the way overlays are displayed on some maps: they actually overlay stuff now.
- Random music tracks in Mario Minix are less repetitive now if the same map is played over and over again.
- Autopause by focus loss will no longer be triggered during the end level sequence.
- Some underground levels got minor graphical improvements in Maximum quality.
- Spikeball Launchers got a better sprite (credit to Bullex).

### Fixes:
- Fixed the Update Checker being non-functional.
- Fixed a bug with a circle transition where it would wrongly stretch and not be centered on the player if the window gets scaled at any point.
- Fixed a bug with a circle transition where it would appear too suddenly if centered at the corner of the screen.
- Fixed a bug with a circle transition where it would not open correctly during lag frames.
- Fixed one of the Human Lab house tiles being misaligned.
- Fixed a bug in Mario Minix where the player did not have faster falling speed while being underwater (regression from 2.0.0).
- Fixed the MF Flash death theme being a regular one, instead of being from SMAS.
- Fixed minor graphical mistakes and layering errors in some places.
- Fixed a visual glitch with platforms which could flicker at some places.
- Fixed toads in the final Story Mode cutscenes being misaligned.

# Version 2.1.1

Released on January 5th, 2026.

### Additions:
- Cheated save pipes in Save Room are now labeled with red text.
- Cheated Progress Continue is now labeled with red text.
- Added a warning before playing extra levels if the game detected enabled console.

### Changes:
- HiDPI external windows may look more blurry than in the previous build, this is due to the engine downgrade to fix Linux issues.
- The "Play recommended" button in level revamp warnings has been renamed to say "Play revamped". This does not apply to the "Level Improvements" tweak.
- The game does no longer require SSE4.2 CPU instruction set to run.
- Windows: The game now supports Windows 7 and 8.1 once again.

### Fixes:
- Fixed XScroll not working as intended.
- Fixed a bug when colliding with tiles would sometimes make the player "hover" under the ceiling for some time.
- Fixed a bug where donut blocks would not activate all at once if the player was standing on multiple of them.
- Fixed a bug where "letthepartybegin" console command would not work as expected in some levels added in 2.1.0.
- Fixed layering issues with enemies in Syzxchulun World 12-1.
- Fixed a bug where some ground tiles in MF Flash 2-2 would have no collision.
- Fixed a bug where Elf Clone would significantly increase speed after touching a platform.
- Fixed MF Flash Worlds 1-3 and 4-2 having incorrect super star music.
- Fixed red paratroopas in MF Flash being synchronized.
- Fixed a bug where the MF Flash intro screen would allow to spam Enter, leading to unexpected results.
- Fixed some misalignments in graphics in the Story Mode starting cutscenes.
- Fixed one of the containers in Christmas Laboratory Level 1 being misaligned.
- Bullex738 has been added to the Christmas Laboratory credits as one of the clone designers.
- Fixed a bug where the Good Luck text would move janky in the lava run sequences.
- Fixed a bug where MF Flash World 4-2 would ignore the Retro Scroll Challenge tweak.
- Fixed a bug where Chilly Worker Clones would cause icicles to appear partially mid-air.
- Fixed a bug where MF Flash ending music would unexpectedly cut off.
- Fixed MF Flash levels and some Christmas Laboratory levels not having the new goal gate glow effect on Maximum quality.
- Linux: Fixed mouse issues.
- Linux: Fixed scaling issues.
- Linux: Fixed exiting fullscreen in Wayland causing window to go to the upper left corner.
- Linux: Brought back compatibility with libTAS.

# Version 2.1.0

Released on January 3rd, 2026.

### Additions:
- Added a New Year special world: Christmas Laboratory.
- Added Syzxchulun World 12. (No Advance Edition yet.)
- Added a Mario Forever Flash port.
- Added HiDPI support for external windows (e.g. console, tweaks menu).
- Added a World Completed screen for The Lost Map and Human Laboratory.
- For keyboard input, pressing Left+Right movement keys will enable slow walking.
- Skin system additions:
- - New global skin tweaks:
- - - `force_override_level_complete_music`, defaults to false. Enabling it will override special level complete music, such as Lost Map, MF Flash, etc.
- - - `enable_starman_run_out_sound`, defaults to false. Will play a `bonus_run_out` global sound when super star power-up is about to end, similarly to P-switch.
- - - `boomerang_spin_sound_delay_sec`, defaults to 0.5. Used to set a loop delay for `boomerang_spin` global sound.
- - New global sounds:
- - - `water_splash_in`, `water_splash_out`, `p_switch`, `bonus_run_out`, and `boomerang_spin`. The water splash sounds are exclusive to skins.
- Added a shortcut warp pipe from MFCE achievements to Classic ones.
- Added a tweak "Improvements in some extra levels", which adds improvements to some extra levels without revamping them completely.
- - Currently, only applies to Syzxchulun's worlds 10-2 and 12-3.
- - The "Revamped level design in extra levels" tweak no longer affects Syzxchulun's world 10-2.
- Added Softendo graphics on maximum quality to BTE World 9.
- Added lights behind finish lines on maximum quality.
- Added an indicator in Minix main menu to show that the leaderboard is online.
- Added more information to the `-- --speedrun-stats` overlay, including "real velocity", position in the level, and "ghost speed".
- Added a confirmation screen when selecting to open the skin editor from the Skin Setup.

### Changes:
- Updated the Skin Editor to version 1.0.4.
- - Change log can be found [here](https://github.com/meteo-dream/MFCE-skin-creator/commits/main/?since=2025-12-15&until=2026-01-04).
- Removed "Copyright-free OST" tweak.
- - Can still be enabled by setting `force_enable_deprecated_tweaks` to `true` in the tweaks.thss file.
- Changed font in the Tweaks menu.
- "Revamped level design in extra levels" tweak is now disabled by default.
- Some level design changes in the "Harder story mode level design" tweak, which more closely resemble the 1.16.1 version of Mario Forever.
- Reset Data window does no longer require to tick a checkbox.
- The game now requires the SSE4.2 CPU instruction set to run.
- Windows: The game does no longer support Windows 7, 8, and 8.1, requiring at least Windows 10 to run.

### Fixes:
- Fixed final story mode Bowser having 21 health points instead of 20.
- Fixed a softlock when attempting to freeze Bowser with an ice flower.
- Fixed loop frame offsets for skins being ignored in some places.
- Fixed bricks in the Minix "Underground" map being brown.
- Fixed the blur transition not being centered correctly.
- Fixed a bug where the crouching animation would not play correctly when customized with skins.
- Fixed electric corals not dealing damage continously.
- Fixed a bug in Expert World 8-3 where a lava splash would randomly appear mid-air with a fire flower.
- Fixed the console command suggestions not accounting for the last command in the command list.
- Fixed a bug where the player appeared in a wrong position when warping to pipes near the autoscroll screen border.

# Version 2.0.2

Released on September 13th, 2025.

### Additions:
- Added a level selector for Syzxchulun Worlds, appears for the respective world after completing it.
- Added a confirmation screen when quitting the game from the Pause menu.
- Added a grace time of 0.05 seconds for running after releasing the run button, making it possible to launch a projectile with the same key while having the same speed, if done quickly. Does not apply with Auto Run tweak.
- Added an indication in Save Room about completed levels to the Otherworld, BTE World 9 and Human Lab Tower pipes, along with their purple variant when completed in secret mode.
- Added an `itembox` console command.
- Added a hidden tweak "original_snes_pitch", accessible only through editing the `tweaks.thss` file. Slows down some higher pitched SPC tracks by 2.4%. Only level music is affected.
- Added an update checker to the save game room, if main menu was skipped.

### Changes:
- Some Expert Mode balance changes:
- - Added a bonus area to Expert 4-3.
- - Time limit in Expert 4-3 has been increased from 440 to 480.
- - Expert 4-4 boss arena now has slightly easier Roto-discs.
- - In Expert 6-1, a few piranha heads have been removed from moving platforms right before checkpoint.
- - Some minor balance changes in Expert 6-4.
- - Otherworld level 8 has been changed to its original level design, after being accidentally nerfed in 2.0.0 release.
- - - Item shop is no longer available, and one of the paths have been blocked to force only one path.
- - Expert 5-3 in secret mode now has unique level design changes.
- Some graphics have been updated:
- - Roto-disc central balls (along with their Expert 8-2 variant), podoboos, finish line, and some other graphics have been updated.
- - Underwater rocks and corals background graphic has been improved.
- - Some map graphics have been changed very slightly.
- - Springboards in medium and maximum quality are now a bit smoother.
- - Otherworld level 5 background is now smoother.
- In the confirmation screen that appears when erasing a Progress Continue, the Erase/No options have been swapped, making No the default option.
- The graphics in regular Syzxchulun World 9 are no longer mixed with Softendo's graphics, and vice versa. World 9-4 is not affected.
- Expert 7-2 soundtrack is now affected by "Copyright-free OST" tweak.

### Fixes:
- Fixed a bug on some Linux systems where the background in tweak menu had black pixels.
- Fixed Otherworld level 8 boss being immune to projectiles.
- Fixed a bug where Expert World 7 map music would change to default World 7 if Soundtrack tweak is set to something other than Mixed.
- Fixed a bug where castle lamps on maximum quality would appear over non-background objects.
- Fixed a bug where Expert 1-2 warp would take to an unintended level in a completed save pipe.
- Fixed a bug where regular Syzxchulun Worlds would not show purple text label when completed in secret mode.
- Fixed hardcoded sounds for Bob-omb kick, Minix shell kick, Minix coin pipe appearing, and switching maps in Minix leaderboards.
- Fixed a bug on some systems where Otherworld level 8 had jittery spike ceiling near the end.
- Fixed a bug in Expert Mode during the lava run sequence where the item box would overlap other elements of the HUD.
- Fixed a bug in Syzxchulun's World 10-2 where some objects could show below power-up blocks.
- Fixed a Toad House being accessible in Syzxchulun's World 10-2.
- Fixed a bug in Minix where coins from coin pipes would not disappear off-screen, making performance degrade over time.
- Fixed a bug where Boos had square shaped hitboxes. They're circles now.
- Fixed some buttons in Minix game over screen being spammable.
- Fixed a bug where "Submit your score" button in Minix could not be selected with mouse.
- Fixed a bug where trying to submit Minix score without internet would not show any error message.
- Fixed a bug on some Linux systems where Minix leaderboards text would be off-centered.
- Fixed a bug where bullet launchers in Expert 8-4 would keep shooting after scroll stops.
- Fixed Goombas being unstompable for a few frames after being thrown by Goomba Bros.
- Fixed a bug where falling question blocks in World of Stupidity - 3 would appear upside-down.

#### Engine fixes:
- Fixed Hammer Bros. killed sprites in medium and maximum quality having an incorrect offset.
- Fixed Starman and Hammer power-ups playing higher pitched kick sounds when not supposed to.
- Fixed a bug when collecting stopwatch items in a quick succession.
- Fixed some layering issues with Roto-discs.
- Fixed a bug where enemy fireballs played a custom "fireball_bump" skin sound effect.
- Fixed a softlock when attempting to grab a power-up and dying at the same time with "Pause on Suit Change" tweak enabled.
- Fixed a bug where Koopa Shells could launch very high up when colliding with platforms.
- Fixed a bug where "X" map markers would not show up properly in some cases.
- Fixed a bug where progress continue screen would show world text incorrectly.
- Fixed a bug where Poisonous Mushrooms could kill the player after crossing the finish line.
- Fixed a bug where the game would not automatically pause if minimized by clicking the taskbar icon.
- Fixed a crash when attempting to freeze a Paratroopa with iceballs while being inside of it during i-frames.
- Fixed a bug where Chilly Thwomps could be frozen with iceballs, leading to a buggy behavior.
- Fixed a visual bug where springboards on medium and maximum quality could get stuck in an unintended animation.
- Fixed a bug where stone piranha plants could not be killed with boomerangs.

# Version 2.0.1

Released on August 30th, 2025.

### Changes:
- The initial offsets of Green and Red Paratroopas are now fixed across all sessions and do no longer feature an RNG element.
- Removed 1 goomba near the end of Expert 5-3.
- The last power-up box in the Expert 3-4 has been moved slightly to the left.
- Some graphics have been updated (Credits to Zik The Green and SerafimGWS):
- - Coral Blocks do no longer have a black outline.
- - Green underwater blocks now look smoother.
- - Otherworld Level 7 tiles now look better and more constistent with the rest of the game.
- - Accelerated Bullet Launchers have been slightly corrected.
- - Bricks, rotodisc central balls, and some other graphics have been changed slightly.
- Thwomps in Expert 2-5 now have a slightly expanded trigger area.
- Otherworld Level 8 now features fast respawns.
- The "Fanmade Worlds Zone 2" direction sign in the Save Room now says "Expert Mode".
- Expert 7-1 now forces a set RNG seed.

### Fixes:
- Fixed Otherworld Level 8 warp pipe transferring to an incorrect level, making it impossible to see the credits.
- Fixed a save pipe showing "World 101" when entering a Hardcore World 1 warp from World 1-2.
- Fixed hardcoded player jump sounds in World 2-5 castle cutscene and the final boss cutscene.
- Fixed Expert 7-2 soundtrack being too quiet.
- Fixed Expert 3-1 mistakenly featuring too many power-ups.
- Fixed a graphical glitch at the top of the screen in Expert 6-4 on MAX graphics.
- Fixed an incorrect HUD graphic in the final fight of Expert 8-4; it now matches the actual boss graphics.
- Fixed frog suit being unable to perform the look up animation while holding something.
- Fixed paratroopas in Expert 8-3 dying immediately.
- Fixed the "BOMB" explosion effect being killable by boomerangs.
- Fixed a graphical bug with a bullet launcher in Expert 7-4.
- Fixed some layering issues with enemies in Syzxchulun's World 10-4.
- Fixed fast spinies usually found in Hardcore Worlds and Lost Map disappearing from the level immediately after spawning.
- Fixed dying after crossing the finish line still letting you to continue in some cases.
- Fixed stomping Blue Paratroopas on MED and MAX qualities not making the "wings fly off" effect.
- Fixed the dead Hammer Bro sprite being slightly off-centered.

# Version 2.0.0

Released on August 29th, 2025.

### Additions:
- Added Mario Forever Expert Mode to The Community Edition Zone.
- - Expert Mode takes the 8 story mode worlds and makes them much more difficult, adding unique obstacles.
- Added Beyond The End World 9 - a new volcano-themed world by Meteo Dream.
- Added Syzxchulun's World 10.
- Added Syzxchulun's World 10 Advance Edition.
- Added a new startup screen that's shown if you've never launched MFCE before. It allows to select preconfigured presets for tweaks. Can be accessed again by deleting the Tweaks data through the in-game menu.
- Added more tweaks to the game:
- - "Crouch Jumping", allowing to jump while crouching. For balancing reasons, you cannot accelerate more than the walking speed limit when crouch jumping, although the old speed still remains. Enabled by default.
- - "SMB1 Damage System", an optional challenge.
- - "Require pressing Up input to buy items in the Save Game Room shop". Disabled by default.
- - "Auto Run", which inverts the Run input. If used, it's recommended to remap the Run and Attack inputs to different keys.
- - "Coyote Time", providing extra frames to jump when running off of a ledge. Enabled by default.
- - "Show a warning on revamped levels", which shows a new warning screen before playing a level that has 2 different versions. Enabled by default.
- - "Faster Save Deletion", decreasing the time it takes to delete a save profile in Save Room.
- - "No Audio Effects", which forcefully disables audio effects (echo) even on Medium or Maximum quality.
- - "Super Jump Bug", bringing back an old bug from Mario Forever that can be used in Warpless speedruns. Disabled by default.
- - "Copyright Free OST", which changes pitch of some sound tracks slightly. (This has nothing to do with the zSNES/Snes9x music pitch that was there in the original game.) Enabled by default.
- - "Unique sound when selecting menus with mouse", which is enabled by default. Disabling it will play the same sound as when using the keyboard.
- - The following 2 tweaks are only accessible through editing the `tweaks.thss` file: "amiga_ntsc_pitch" and "pitch_music_everywhere".
- Added a toast notification when a multi-tasked achievement gets progressed.
- Additions to the Skin System:
- - Added the Skin Editor program, which is accessible either through the newly added `Launch Skin Editor` bat script, or by selecting `Skin Editor` in the Skin Setup menu.
- - Added more customizable skin audio.
- - - The old "voice lines" category of audio has been reworked into Global Sounds.
- - - - These sounds can be played back in the `Skin Setup` > `Sound Test` menu.
- - - The old "sound effects" category of audio can now be different for each player suit.
- - - All of the sounds now support up to 11 variations, which may play at random.
- - Added an ability to add particles around the character.
- - Added more custom animations exclusive to skins, e.g. <code>look_up</code>, <code>p_run</code>, etc.
- - Added skin global tweaks, mainly for particles customization.
- - Added skin player suit tweaks, mainly for newly added skin-exclusive animations.
- - A part of Story Mode text can now be edited to fit the custom character more.
- Controls screen has been expanded with more inputs to customize:
- - Menu: **up**, **down**, **left**, **right**, **accept** and **back**: used when navigating through menus.
- - **Menu Extra**: used in place of the previously hardcoded Space button.
- - **Save Toggle**: used to access world/level selector in the save room, and for some other actions.
- - Some menu inputs can not be mapped to conflicting keys to avoid being locked out from the game entirely. Currently this only applies to keyboard keys.
- Controller players can now access the level selector using **Up** + **Save Toggle** inputs.
- The game now precompiles all shaders on the start of the game, which should avoid freezes when playing the game for the first time.
- - If there are problems with this feature, compilation can be skipped using a command line argument <code>-- --no-shader-precompile</code>.
- The Credits screen can be manually scrolled using Menu Up/Down keys or a mouse scroll wheel.
- Added an extra hint to a Secret Challenge mode if all Classic achievements have been unlocked.
- Added task indication to enemy battle levels.
- Added more leniency for detection on platforms.
- Added a command line argument `-- --speedrun-stats` that adds some counters at the top-right of the game window useful for speedrunners, showing player's X speed, Y speed, and Individual Level counter respectively. The game does not count this as a cheat.
- Added an alternative method of unlocking the console and the access to Secret Challenge mode.
- And many more little things not listed here.

### Changes:
- The Skin System now has a slightly different structure of files; if you used custom sounds, please refer to the [updated skin guide](https://gist.github.com/jue131/e425619bc898df9feaa56cde6588216e#updating-the-skin-for-mfce-v20) for more information.
- When Super Star invincibility ends, the level music now resumes from where it left off (like in MF v5.08+).
- If the "harder level design" tweak is disabled, save game room will have less pits for easier navigation.
- Syzxchulun's World 9-2 at Max quality now more closely resembles the look from Mario Forever v6.0.
- The default gamepad controls do no longer include analogue inputs for menu navigation, as they were bugged.

### Removals
- Removed tweak "Life every 1 million score", as it was bugged.
- Removed tweak "Air Attack animation", replaced by a Skin Suit Tweak with the same functionality.
- Removed tweak "Hint Signs", it's now always enabled.

A full changelog will come out later.

# Version 1.1

Released on December 5th, 2024.

### Additions:
- Added World 9 by Syzxchulun to Fanmade Extra Worlds Zone.
- Added support for sound effect customization for jumping, swimming, taking damage, and losing to the Skin System.
- Completed save pipe is now marked as green.
- Completed save pipe now saves the selected level and world between sessions.
- Linux version is now included.
- Added a hint sign to Human Laboratory World about a hidden level. Make sure the hint signs tweak is enabled.
- Post-Endgame: Added a few more console commands, including infinite lives and timer.

### Changes:
- Bullet launchers now work the same way as they did in the original game.
- A hidden bonus level has been buffed with more power-ups.
- Analogue motion controls are now faster by 25%, in case if your controller does not allow full deviation from the center for software.

### Fixes:
- Fixed controller remapping not working.
- Fixed player jerking against a wall when using analogue motion controls.
- Fixed enemies getting stuck on tanks.
- Fixed progress achievements not saving properly.
- Fixed a softlock if you press F3 or F4 during a skippable cutscene.
- Fixed warping from an upside-down pipe with Super Mushroom in ????? mode.
- Fixed 3-4 & 4-4 darkness when screen shakes.
- Fixed silver hammer hitbox.
- Fixed bullet bill hitbox.
- Fixed an issue where trying to enter a save pipe in ????? mode would often pop up wrong messages.
- Fixed New Mario skin having incorrect swim texture offsets for Small Mario.
- Fixed Lava Run softlock if you die with "pause on suit change" tweak enabled.
- Fixed whirlpools sometimes getting the player stuck near a wall.
- Fixed deactivation range of Cheep Cheeps.
- Fixed scenery in Human Lab level 3.
- Fixed selector in Mario Minix Leaderboards ignoring selector sprite from the current skin.
- Fixed water trigger size in 7-3.
- Fixed some lights from lava that could appear regardless of the quality setting.
- Fixed a typo in the ending credits.
- Fixed a bug where the player could disappear during the Bonus Level winning sequence.
- Fixed a bug where the player would continue flashing even after disabling invincibility using console.
- Fixed a crash if you input finish console command multiple times in a row.
- Warping to an extra level from the save room now removes all the unnecessary playing audio before it loads anything, instead of afterwards.
- And many more bug fixes.

# Version 1.0

Released on November 28th, 2024.

- Game released!