# The Hidden Problem with NFL Confidence Pools: How Bye Weeks Break Fair Scoring

## The Confidence Pool Scoring Problem

NFL confidence pools are supposed to be about skill, strategy, and football knowledge. But there's a fundamental flaw in how most pools handle bye weeks that creates unfair advantages and disadvantages throughout the season. The problem isn't just annoying—it's mathematically broken.

## How Traditional Confidence Pool Scoring Works

In a standard confidence pool with 16 games:

- You rank games 1-16 based on confidence
- Your most confident pick gets 16 points
- Your least confident pick gets 1 point
- Maximum possible score: 136 points (1+2+3...+16)

> But what happens when there are only 14 games due to bye weeks? Most pools simply eliminate the top confidence values, so you rank games 1-14 instead. This seems logical, but it creates a massive scoring imbalance.

## The Bye Week Data Reveals the Problem

Here's how bye weeks affect scoring throughout an NFL season:

| NFL Week | Teams on Bye | Total Points Possible | Relative Importance |
| -------- | ------------ | --------------------- | ------------------- |
| 1        | 0            | 136                   | 111.27%             |
| 2        | 0            | 136                   | 111.27%             |
| 3        | 0            | 136                   | 111.27%             |
| 4        | 0            | 136                   | 111.27%             |
| _5_      | _4_          | _105_                 | _85.91%_            |
| 6        | 2            | 120                   | 98.18%              |
| 7        | 2            | 120                   | 98.18%              |
| **_8_**  | **_6_**      | **_91_**              | **_74.45%_**        |
| _9_      | _4_          | _105_                 | _85.91%_            |
| _10_     | _4_          | _105_                 | _85.91%_            |
| 11       | 2            | 120                   | 98.18%              |
| _12_     | _4_          | _105_                 | _85.91%_            |
| 13       | 0            | 136                   | 111.27%             |
| _14_     | _4_          | _105_                 | _85.91%_            |
| 15       | 0            | 136                   | 111.27%             |
| 16       | 0            | 136                   | 111.27%             |
| 17       | 0            | 136                   | 111.27%             |
| 18       | 0            | 136                   | 111.27%             |

**The Problem**: Week 8 (with only 13 games) has 25.55% less scoring potential than full weeks. This means a perfect week during bye weeks is worth significantly less than a perfect week with 16 games.

## Why Removing High-Value Points Is Wrong

When pools reduce from 16 games to 14 games, they typically eliminate the 15-point and 16-point games, leaving scoring from 1-14 (105 total points). This approach has two major flaws:

### 1. Disproportionate Impact on Strategy

Your highest-confidence picks—the ones you've researched most—become unavailable. It's like being forced to bench your best players.

### 2. Mathematical Imbalance

The loss of high-value points (15+16=31) represents 22.8% of the total possible points, creating massive week-to-week variance that has nothing to do with skill.

## How Major Platforms Handle Bye Weeks

Unfortunately, most major confidence pool providers use the flawed "remove high values" approach, though their specific implementations vary:

### Yahoo Fantasy Sports

**Method**: Eliminates highest confidence values during bye weeks

- 14 games available → rank 1-14 (loses 31 points)
- 13 games available → rank 1-13 (loses 45 points)
- **Impact**: Creates the full 25.55% scoring disadvantage during Week 8

### CBS Sports Fantasy

**Method**: Offers both styles of scoring

### Others: Unable to confirm at the moment on options. This is mostly a Yahoo complaint but let me know how they handle it and I'll update here

## A Better Solution: Remove Low-Value Points Instead

Instead of eliminating 15-16 point games, pools should eliminate 1-2 point games when there are fewer matchups available. Here's why this creates better balance:

### Comparison of Approaches

**Traditional Method (Remove High Values)**:

- 14 games: 105 points possible (85.91% of baseline)
- 13 games: 91 points possible (74.45% of baseline)

**Better Method (Remove Low Values)**:

- 14 games: 133 points possible (98.76% of baseline)
- 13 games: 130 points possible (96.53% of baseline)

The improved method maintains much more consistent scoring potential across all weeks, reducing the arbitrary advantage/disadvantage created by bye week timing.

## The Real-World Impact

Consider two equally skilled players:

- **Player A** has their best weeks during Weeks 1-4 (16 games available)
- **Player B** has their best weeks during Weeks 8-9 (13-14 games available)

Under traditional scoring, Player A's excellent performance could earn 136 points, while Player B's identical performance level earns only 91-105 points. This 25-45 point swing has nothing to do with football knowledge or strategy.

## Why This Matters for Season-Long Competition

In season-long confidence pools, these scoring imbalances can determine winners and losers based on pure luck of when you perform well, not how well you perform.

## The Math Behind Fair Scoring

The ideal confidence pool scoring should maintain consistent relative importance across all weeks. When forced to eliminate games:

- **Worst Case** (Week 8, 13 games): 130 points possible vs. 136 baseline = 95.6% relative value
- **Best Case** (Weeks 1-4, 13, 15-18): 136 points = 100% relative value
- **Variance**: Only 4.4% difference vs. 25.55% under traditional method

This creates a much more skill-based, fair competition.
