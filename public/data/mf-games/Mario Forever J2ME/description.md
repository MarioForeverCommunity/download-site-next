This was an experiment in which I used Claude Opus to try to port Mario Forever 5.0 by Buziol Games (Michal Gdaniec) to old brick / flip / slider phones that support Java. Decompilers were not used, instead the game's data binary (PAME from the packed .exe) was converted to the format used by the J2ME runtime from Fusion (.ccj from the .jar). The runtime itself had to be modified in various ways in order to support a game like this. Sadly the game does not run well on actual J2ME phones. It runs fast enough on emulators because those are shims over Java runtimes running apps on your PC or smartphone, not device emulators.

Features:
- Mostly polished (but sadly with slow performance)
- Support for phones with the resolutions 240x320 (turned sideways), 320x240 and 640x480 (Nokia E6-00), standard keycode binds and enough heap (java RAM).
- Modded Fusion J2ME runtime: frames are not loaded all at once into the RAM, images are now stored in containers as opposed to being stray (benefitting phones with slow file operations, there is no Clickteam image obfuscation now either), screen drawing that can scale to lower resolutions and is resistant to failure on certain models, configurable machine-independent speed through the jad file (frameskip starts at 15 fps at most by default), dip switches in the jad file that allow you to troubleshoot image, sound and memory issues.
- A couple worlds were tested, not the whole game to completion though.

Known limitations:
- There is no ktkm tracker or wav music. I will have to think what to do about it: old phones largely used MIDI files for music and WAV files for sound effects. I do know that OpenMPT has a module to MIDI though.
- Even on some flagship phones the performance is slow or it doesn't go into the save game room probably because of low RAM. I have some ideas, such as stripping unused copy-pasted things from frames (will also help file size).
- The file size is sadly large. Some optimization has been done, such as lossy compression on the images (negligible) and on the sounds. Some ideas I have for the next release include compressing resources with some algorithm such as LZMA.
- There is no transparency support in any version of the Fusion J2ME runtime. Various phones do have such support though. A few things look weird with baked transparency.
- I made the decision to axe all screen transitions for now because I couldn't get them right. They may be re-introduced later. No version of the Fusion J2ME runtime supports object transitions. The infamous Level 3-3 has not been tested to completion.
- There is no support for the Sony Ericsson K800i device family (game crashes for unknown reasons, maybe low RAM) or Motorola V8 device family (I don't have this phone, the game could work in theory but the keybinds are not mapped to the Motorola V8 keys).
- The erase save key is mapped to the phone's clear key (remove letter) and debug keys in Minix and 7-2 are also mapped, both are poor decisions that will be remedied hopefully next time.

Tentative release date of 1.1.0 is November 6. Source code and tools (slop) will be released at the same time.

Project link (temporary and will be moved): https://github.com/TwoSpacesSG/assorted-slop

If anyone knows ways to optimize the game that I'm missing then please tell me.