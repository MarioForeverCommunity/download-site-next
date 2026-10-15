# New Super Mario Forever 2012: Slightly-Fixed Plus Edition

![Logo](./src/nsmfsfe.png)

This is the Plus Fork of CST1229's [New Super Mario Forever 2012: Slightly-Fixed Edition mod](https://github.com/CST1229/NSMF2012SlightlyFixed/). Built on version 1.1.1 (the latest version) of the mod, it contains most changes and improvements that version has upon the original game, while also adding many more. 

The project files, for use with [GameMaker 8.2](https://gm82.cherry-treehouse.com), can be found in the source code.

(This mod is virus-free, obviously.)

## Download

[See the Releases page.](https://github.com/zikthegreen/NSMF2012SlightlyFixedPlus/releases/tag/Release).

## Controls
(Can be rebinded in the options.)
- Arrow keys: Movement (and entering pipes)
- Z: Jump
- X: Fire (there is no run button)

## Changes made from the original

[Most changes in the original mod](https://github.com/CST1229/NSMF2012SlightlyFixed#changes-made-from-the-original), plus extra ones:

- You can now pause the game by pressing P or Esc key. This also means Esc key no longer closes the game, but instead pauses it.
- You can now double the game speed by pressing Q, accompanied by custom SFX, and will return to x1 speed when Q is pressed again.
- Certain enemy objects and player projectiles that went through semisolids now actually land on them.
- Pulling vegetables or special bricks takes precedence over shooting, meaning you no longer need to consume all your ammo before grabbing them.
- You can kill the Boomer with the Fire key, which also allows another one to immediately be thrown after.
- When moving in mid-air, you can switch directions by holding the opposite direction key and shooting, rather than always being locked to one direction in mid-air.
- Most of the soundtracks have now been identified.
- Holding up allows any projectile or held object to be thrown higher.
- Mario's hammers have a bigger radius, so hitting enemies is more consistent.

## Modified physics toggle

You can now switch between Classic player physics and Modified player physics by pressing T. Classic physics preserves core physics (some minor QoL physics changes, such as vegetable pulling precedence, bigger hammer radius, being able to change direction in mid-air when shooting, are kept), while Modified physics essentially adds a new experience to the player physics. New Modified physics include:
- Better player control, so skidding is less slippery and mid-air control is more precise.
- You can freely switch directions at any time in mid-air. (Classic physics has direction switching, but only when shooting in the opposite direction)
- You can crouch jump, also keeping any previous momentum.

For the toggle to be kept between sessions, the game creates a modifiedphysics.ini file, which the game will then read on the next session and keep the toggle on if the value is 1, or off if it is 0.

## Credits
- Original game and World Maker level editor made by Softendo.
- Original mod made by CST1229.
- Plus fork made by Zik the Green.
