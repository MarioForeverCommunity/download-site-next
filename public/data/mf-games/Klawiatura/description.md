## Source codes & release/dev builds:

- **GAME:** [https://github.com/toggins/Klawiatura/releases/latest](https://github.com/toggins/Klawiatura/releases/latest)
- **LEVEL EDITOR:** [https://github.com/toggins/KlaEditor/releases/latest](https://github.com/toggins/KlaEditor/releases/latest)

Klawiatura is an experiment written by me and [@nonk](https://marioforever.space/user/nonk) that implements multiplayer using GekkoNet's rollback netcode. In layman's terms, the game uses save states to sync up the entire level with other players, so only your input is sent over the network.
Usually, this kind of networking where save states are utilized is intended for less demanding games, such as one-on-one fighting games. But since Mario Forever is simple enough, you can fit its entire game state into ~200 KB of static data...which is why I wrote Klawiatura in C. Not having to worry about performance and easily implementing save states using direct memory copies is a big plus.

## Current features

- Up to 8 players!
- Lobby system using NutPunch. You can enter games as a player or spectator.
- Fully playable examples of World 1 (`1_1`), World 2's ambush (`hammer_bros`), Hardcore World 1 (`hardcore_1_1`) and Funny Tanks (`funny_tanks`).
- `KEVIN` and `FRED`.

So yeah, that's pretty much it. Check out the GitHub link at the top.
