# grillsay

> It's like `cowsay`, but the cow has opinions about your lawn.

```
 ________________________________________
/ Back in my day, we grilled uphill both \
\ ways.                                  /
 ----------------------------------------
         \  
          \  ___
            /   \ 
          C| o  o|D      [#]
           |   D |       /
         ___\ <>/__    _/
        /    ---   \ 6( )      
        \ \    ___\ \/ /   ~     ~
        |\ \__ _   \__/   ~    ~~
        | \___P 3  |    ___~__~___
        |____ |_| _|    \########/
        |    __   |      \______/
         \   |   /       /  |   \
          \  |  /       /   |    \
           | | |_      /    |     \
          _| |___>    /     |      \
         <___|              |
```

## What is this?

`cowsay` was a beloved Unix tool that made a cow say things. That cow was young, carefree, and completely silent on the topics of property taxes, kids these days, and the correct way to cook a steak.

`grillsay` fixes that.

This is a Deno implementation of `cowsay` starring a boomer at the grill — spatula in hand, charcoal only, and very eager to share his thoughts.

## Requirements

- [Deno](https://deno.land/) (any recent version)
- A message worth grilling about (optional — he's got plenty of his own)

## Usage

```sh
deno run --allow-read src/main.ts "You call this a brisket?"
```

Or with the built-in task:

```sh
deno task grillsay "Gas grills are for quitters."
```

Pass no arguments and the grill master will speak from the heart:

```sh
deno task grillsay
# Back in my day, we grilled uphill both ways.
```

## Installation (compile to a binary)

```sh
deno task build
./grillsay "Nobody under 40 knows how to shake a hand."
```

## Examples

```
 _______________________
< You call this medium?  >
 -----------------------
         \  
          \  ___
            /   \ 
          C| o  o|D      [#]
           |   D |       /
         ___\ <>/__    _/
        /    ---   \ 6( )      
        \ \    ___\ \/ /   ~     ~
        |\ \__ _   \__/   ~    ~~
        | \___P 3  |    ___~__~___
        |____ |_| _|    \########/
        |    __   |      \______/
         \   |   /       /  |   \
          \  |  /       /   |    \
           | | |_      /    |     \
          _| |___>    /     |      \
         <___|              |
```

```
 ________________________________________
/ In MY neighborhood we left the doors   \
\ unlocked.                              /
 ----------------------------------------
         \  
          \  ___
            /   \ 
          C| o  o|D      [#]
           |   D |       /
         ___\ <>/__    _/
        /    ---   \ 6( )      
        \ \    ___\ \/ /   ~     ~
        |\ \__ _   \__/   ~    ~~
        | \___P 3  |    ___~__~___
        |____ |_| _|    \########/
        |    __   |      \______/
         \   |   /       /  |   \
          \  |  /       /   |    \
           | | |_      /    |     \
          _| |___>    /     |      \
         <___|              |
```

## FAQ

**Why a grill?**  
The original `cowsay` cow was never going to tell you that you're using too much lighter fluid. Someone had to.

**Is charcoal required?**  
Yes. This tool will not compile on a gas grill.

**Can I pipe input to it?**  
No (actually, yes). He doesn't take orders. He gives them.

## License

Do whatever you want with it. He's not your father. (Though he will ask if you've met his son-in-law, very successful, works in finance.)
