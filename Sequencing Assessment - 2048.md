# 2048
One casual game that was very famous amongst Sequencing.com devs was 2048.
You can find many implementations of it online, as well as many different variations.
 
## Specifications
- The grid consists of 4x4 tiles
- At the beginning of a game, the grid is empty, except for one tile of value 2 placed at random.
- The user can slide the tiles either up, down, left, or right
- After each slide, a new tile with value 2 will appear in a random free space.
- If there is no free space to put the new tile, the game is lost
- During the slide, tiles of equal values pushed into each other will merge into a new tile with the combined value. 
	- 2 + 2 = 4 | 4 + 4 = 8 and so on...
- If there are 3 values next to each other, e.g., 2 2 2, and the player slides right, the values closest to the wall should merge first, resulting in [2][4].
- If any tile reaches the value of 2048, the game is won.

## Main task
Implement a frontend application allowing you to play this game.
We use React as our main framework, so any version above v16 is fine.

## Judgment criteria
We care about well-structured, maintainable code and specifications covered as much as possible, with the ability to justify your choices and decisions.
Polish is great, and we want to see it, but the ability to find a balance between time spent and output is much more highly valued.
Make sure the source code has instructions on how to run it. Ideally, npm run start should be enough.