# Art Exhibition Game

Source code for the [nodeGame](https://nodegame.org) game Art Exbition Game, as in the following academic papers:

1- Balietti, S. and Riedl C. (2021) ["Incentives, competition, and inequality in markets for creative production"](https://www.sciencedirect.com/science/article/pii/S0048733321000160?dgcid=author), Research Policy Volume 50, Issue 4

2- Balietti, S., Goldstone, R.L., and Helbing, D. (2016) "[Peer Review and Competition in the Art Exhibition Game](https://www.pnas.org/content/113/30/8414)", Proceedings of the National Academy of Sciences (PNAS) Volume 113, Number 30, pp. 8414-8419

Numbers

## Installation

Clone/download the repository and save it inside the nodeGame games/ directory.

## Treatments

In file `game/game.settings.js` 6 treatments are available:

- **rank_same**: corresponds to condition "Flat" of Paper 1.

- **rank_skew**: corresponds to condition "Tiered" of Paper 1.

- **threshold_random_com**: corresponds to condition "Com" of Paper 2.

- **threshold_random_coo**: corresponds to condition "non-Com" of Paper 2.

- **threshold_select_com**: corresponds to condition "Com" with non-random review selection of Paper 2 (see Appendix).

- **threshold_select_coo**: corresponds to condition "non-Com" with non-random review selection of Paper 2 (see Appendix).

## Notes

Current codebase is ported to nodeGame version 6 from previous versions. It is _not_ the exact code used in either paper. In particular, a notable difference from paper 2 is that creation and submission are in two separate steps, instead of in the same step with a popup window. Moreover, in paper 2 there was no pre-game survey, only a small demographics survey at the end of the experiment. Finally, actual payoff values are different.

## Links

- https://stefanobalietti.com
- https://nodegame.org
