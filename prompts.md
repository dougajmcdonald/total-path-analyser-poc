We're making great progress, thank you!

Next we're going to work on a new /package called "lorcana/simulator" and it's job is to read understand the game rules and actions available to a player each turn and simulate the various permutions available and evaluate the actions for how "optimal" it is (we will define the evaluation rules later).

The basic game works by executing various actions, some of which are global e.g. drawing a new card, some are performed on cards in the players hand, and others are performed on cards "in play" the cards in play for each player effective form the board state.

The actions are performed in sequence, as some depend on the resultant state of the previous action, for example, playing a card would happen after drawing a card for the turn as the available cards have now changed.

The basic rules are: 
- There are two players, each with a deck with a minimum of 60 cards.
- At the start of the game, both players draw 7 random cards from their deck
- These 7 cards form their hand

Let's not go any further until you can help propose a model for the game. We can define some of the static game aspects in the 'rules' package, for example minimum number of cards in a deck and number of cards to draw at the start>
Other aspects, like the functions to "init" a game, randomly draw a card etc will need to be in the new similator package.

Run your thoughts past me first so I can validate the proposed approach before we continue.

====
1. There is no max size, hands start at 7 but can increase (theoretically up to 60) and down to 0, depending on how many cards are played each turn.
2. Yes, that's broadly correct, the structure is:
- ready all "exerted" cards in play, the ready phase, cards which have performed an action (questing to win their lore, challenging an oponents character, or singing a song) are set to ready, so we need to represent within the cards on board, ready/exerted
- draw - draw a random card from your deck
- perform actions, either a card action, "quest" to win their lore on the card that quests, "challenge" and opponents character (opponent card has to be exerted to do this), "sing" where a character in play exerts to sing a song card from hand, (the cost of the song has to be less than or equal to the cost of the character).
- there are various game state checks, but lets not worry too much about those yet, we can work through as we hit them.
3. Yes, first to 20 lore wins
4. Inking happens at any point after drawing and before passing, inking is an important mechanic which can onyl be performed on "inkable cards". Inking is effectively how you gain the resources needed to "play" a character. The cost of a character has to be equal or less to your amount of available ink. inking a card puts it into you "inkwell" facedown. This increases your inkwell by "1" this now means you can play a card from your hand to the board by exerting the ink equivalent to the cost of the card you want to play.
5. Yes, exactly that, we need to track exerted and ready, and also "drying" which is the state a card enters play as. drying cards can't challenge, sing or quest, they must wait until the players next turn to do so.
6. We want to go turn by turn. We're going to be focussing on openings as it gets very complex after that! We're going to be focussing on optimising the first 5-7 turns. I want the simulator to model each possible permution and then proceed to go turn by turn to perform each subsequent permution, so effectively total path analysis, hence the repo name! 

Shout for any clarification.

====

Ok, here are the criteria for assessing the cumulative "value" for a sequence of actions which represent a turn.
1. Lore gain - this is the only real that leads to winning, so should be a top priority.
2. Ink efficiency - ideally you want to play "on curve" as in, on turn one, you ink once and play a 1 cost card. On turn two you ink again and play a two cost card and so on. Whilst it's possible to play two 1 cost cards on turn 2 in place of 1, 2 cost card, the power of cards increases with costs, so generally it's better to play as high a cost character as possible
2. Board state - this can be evaluated 3 ways - a) number of cards, more cards on boards is better b) cumulative strength, more is better, c) cumulative willpower, more is better. You should consider d) cumulative lore, generally playing characters than can quest for more lore is better.
3. Ink progressiong, not inking is rarely a good idea unless you have no inkable cards, or inking a would mean you could play nothing, vs a less optimal card.
4. Hand size - bigger hand is better, but it's a low weighing measure as the act of inking and playing cards will naturally reduce hand size.  

Each of these should have weighings so we can adjust things as we go if needed.

====
