//story.ts
export type StoryEffect = {
  life?: number;   // change in life %
  energy?: number; // change in energy
  money?: number;  // change in money
};

export type StoryChoice = {
  text: string;
  cost: number; // energy cost to select
  outcomeText: string;
  effects: StoryEffect;
  afterNarration?: string;
};

export type StoryStep = {
  narration: string;
  choices: StoryChoice[];
};

export type StoryActs = {
  act1: StoryStep[];
  act2: StoryStep[];
  act3: StoryStep[];
  act4: StoryStep[];
};

export const storyData: Record<"Hero" | "Villain", StoryActs> = {
  Hero: {
    act1: [
      {
        narration:
          "You arrive in a struggling town at dawn. The streets are quiet, yet the smell of smoke lingers in the air. Villagers whisper about raiders and corruption in the local guard. You must decide your first step.",
        choices: [
          {
            text: "Help rebuild the burnt houses.",
            cost: 10,
            outcomeText:
              "You spend hours carrying wood and hammering nails. The villagers cheer, and their gratitude fills you with purpose.",
            afterNarration:
              "By sunset, the town feels a bit brighter. Smiles return to tired faces, children play in safer streets, and you feel the warmth of a community trusting you. The day's labor has left you sore, but a deep sense of fulfillment radiates within.",
            effects: { life: +5, money: +2 },
          },
          {
            text: "Train with the local guards.",
            cost: 10,
            outcomeText:
              "You spar with weary guards, showing them new stances and discipline. They feel more confident, though you’re left exhausted.",
            afterNarration:
              "The guards nod with respect, clearly improving under your guidance. Though sweat and bruises ache, a prideful satisfaction lingers. You realize that imparting skill can be just as rewarding as physical gains.",
            effects: { energy: -5, life: +2 },
          },
          {
            text: "Investigate the rumors of raiders.",
            cost: 10,
            outcomeText:
              "You follow tracks into the forest. Though dangerous, you return with knowledge of enemy movements.",
            afterNarration:
              "The intel might save lives in the coming weeks. While minor scrapes sting, a sense of tactical superiority fills your mind. You now see the unseen threats around the town more clearly.",
            effects: { life: -5, money: +5 },
          },
        ],
      },
    ],
    act2: [
      {
        narration:
          "The villagers gather around you, hopeful. Supplies are low, and danger looms near the border. Choices weigh heavily on your shoulders.",
        choices: [
          {
            text: "Organize a food caravan to another town.",
            cost: 15,
            outcomeText:
              "The caravan makes it through with your help. Food arrives, and the villagers bless your leadership.",
            afterNarration:
              "Families gather around the newly delivered food, tears of relief in their eyes. Your planning and guidance saved many from hunger, strengthening their loyalty and your reputation as a capable protector.",
            effects: { life: +5, money: -5 },
          },
          {
            text: "Build defenses at the town gate.",
            cost: 15,
            outcomeText:
              "Walls rise under your command. Though it drains resources, the town feels safer.",
            afterNarration:
              "From the battlements, you see a safer horizon. Villagers nod appreciatively, and even the weary guards stand taller. Though exhausted, you feel a quiet pride knowing the walls may shield countless lives.",
            effects: { life: +2, energy: -5 },
          },
          {
            text: "Go on patrol alone.",
            cost: 15,
            outcomeText:
              "You scout enemy positions at great risk. An ambush wounds you, but you bring back vital intel.",
            afterNarration:
              "Bandages soak up your sweat as you reflect on the danger avoided. The intel could change the course of future confrontations. Pain throbs through your body, but the satisfaction of foresight fuels your spirit.",
            effects: { life: -10, money: +10 },
          },
        ],
      },
    ],
    act3: [
      {
        narration:
          "The raiders finally attack. The town is ablaze with chaos, and your leadership is put to the test.",
        choices: [
          {
            text: "Lead the villagers in a direct defense.",
            cost: 20,
            outcomeText:
              "You rally the townsfolk. Though many are injured, you repel the enemy with courage.",
            afterNarration:
              "Smoke and dust settle over the battlefield. Villagers cheer for your bravery, yet you see the scars etched on their faces. The town is saved, but the cost weighs heavily on you. Their trust, however, remains unwavering.",
            effects: { life: -10, money: +15 },
          },
          {
            text: "Sneak behind enemy lines to disrupt supplies.",
            cost: 20,
            outcomeText:
              "Your risky strike burns enemy wagons. The raiders panic and retreat, though you suffer wounds.",
            afterNarration:
              "Returning to the town, your body aches but your mind is alight with the victory of cunning. The raiders’ morale is broken, and whispers of your bravery spread among the villagers. Risk has borne reward, but at personal cost.",
            effects: { life: -15, money: +20 },
          },
          {
            text: "Negotiate a truce with the raider leader.",
            cost: 20,
            outcomeText:
              "Against all odds, you find words that ease tensions. The leader withdraws his men, sparing the town.",
            afterNarration:
              "The villagers look on in awe as violence gives way to words. Trust in your judgment grows, and you realize the power of diplomacy. Your body is weary, yet your mind is sharper, understanding that strength can take many forms.",
            effects: { life: +5, energy: -10 },
          },
        ],
      },
    ],
    act4: [
      {
        narration:
          "Peace returns. The villagers now see you as their savior. Your journey nears its end, but your legacy is being written.",
        choices: [
          {
            text: "Stay and govern the town.",
            cost: 25,
            outcomeText:
              "You remain, guiding them into an era of stability. You’re remembered as a just leader.",
            afterNarration:
              "Years of governance bring prosperity. Streets are lively, schools flourish, and the villagers’ trust in you deepens. You feel a profound satisfaction knowing your choices built a lasting legacy.",
            effects: { life: +10, money: +10 },
          },
          {
            text: "Leave to protect other lands.",
            cost: 25,
            outcomeText:
              "You march on, ever restless. Tales of your bravery spread far beyond these walls.",
            afterNarration:
              "New horizons call, but the lessons learned here stay with you. The town thrives in your absence, and your deeds echo beyond these lands, shaping a broader tale of heroism.",
            effects: { life: +5, energy: +5 },
          },
          {
            text: "Retire in peace.",
            cost: 25,
            outcomeText:
              "You hang up your sword, living a quiet life. The town prospers thanks to your earlier deeds.",
            afterNarration:
              "Tranquility surrounds you as seasons pass. Villagers occasionally visit to recount tales of your deeds. You rest easy, knowing your efforts left the world slightly better than you found it.",
            effects: { life: +20 },
          },
        ],
      },
    ],
  },

  Villain: {
    act1: [
      {
        narration:
          "The same town lies before you, but your eyes see opportunity. Smoke means weakness, and weakness can be exploited.",
        choices: [
          {
            text: "Extort the frightened villagers.",
            cost: 10,
            outcomeText:
              "Coins are shoved into your hands out of fear. Their hatred simmers beneath the surface.",
            afterNarration:
              "Every stolen coin weighs on your conscience, though power tastes sweet. Villagers avert their eyes, whispers of resentment following you, reminding you that fear may buy obedience, but not loyalty.",
            effects: { money: +10, life: -2 },
          },
          {
            text: "Recruit thugs in the tavern.",
            cost: 10,
            outcomeText:
              "You gather a band of cutthroats. Loyalty is fickle, but numbers give you power.",
            afterNarration:
              "Your new allies watch you cautiously. Their loyalty is shallow, but their muscle can achieve what persuasion cannot. You feel a mix of security and unease, knowing your strength is fragile.",
            effects: { energy: -5, money: +5 },
          },
          {
            text: "Burn another house to sow fear.",
            cost: 10,
            outcomeText:
              "The flames crackle as villagers scream. They bow before your cruelty, though your own health suffers from smoke.",
            afterNarration:
              "Smoke chokes your lungs and the town trembles in terror. Power courses through your veins, yet a bitter aftertaste lingers—fear can dominate, but it isolates you from all trust.",
            effects: { life: -5, money: +8 },
          },
        ],
      },
    ],
    act2: [
      {
        narration:
          "The villagers grow restless. They whisper about rebellion. You must act to tighten your grip.",
        choices: [
          {
            text: "Impose a brutal tax.",
            cost: 15,
            outcomeText:
              "Gold fills your pockets, but hatred rises higher than the walls.",
            afterNarration:
              "Villagers mutter angrily under their breath. You watch as resentment simmers in secret, understanding that wealth today may invite chaos tomorrow. Power feels heavy on your shoulders.",
            effects: { money: +20, life: -5 },
          },
          {
            text: "Execute a rebel publicly.",
            cost: 15,
            outcomeText:
              "Blood stains the square. Fear silences the people, but their eyes burn with vengeance.",
            afterNarration:
              "The crowd disperses in terror, but whispers of rebellion linger. You are feared, undeniably, yet every act of cruelty tightens invisible chains of future danger around your neck.",
            effects: { life: -10, money: +10 },
          },
          {
            text: "Bribe the guards to ensure loyalty.",
            cost: 15,
            outcomeText:
              "The guards stand by your side, but your coffers run lighter.",
            afterNarration:
              "Trust bought with coin feels hollow. Guards nod silently, watching for weakness. You feel a subtle unease, knowing the walls of loyalty are fragile and may crumble with the slightest shift.",
            effects: { money: -10, energy: +5 },
          },
        ],
      },
    ],
    act3: [
      {
        narration:
          "The villagers, at last, rise in open revolt. Their torches march against you.",
        choices: [
          {
            text: "Crush them with mercenaries.",
            cost: 20,
            outcomeText:
              "The mercenaries scatter the mob. Victory is yours, though gold bleeds from your hands.",
            afterNarration:
              "Bodies and cries linger in the air. Though victorious, you feel the cost of maintaining dominance. Fear rules, but even fear leaves scars on your mind as well as theirs.",
            effects: { money: -20, life: +5 },
          },
          {
            text: "Burn the town entirely.",
            cost: 20,
            outcomeText:
              "The town screams as flames engulf it. You stand among ashes, victorious but hated eternally.",
            afterNarration:
              "Silence follows the blaze, broken only by crackling fires. Fear rules your name, but hatred festers in every corner. You feel alone atop the ruins, powerful yet hollow.",
            effects: { life: -15, money: +30 },
          },
          {
            text: "Flee and regroup elsewhere.",
            cost: 20,
            outcomeText:
              "You escape into the shadows, your empire crumbling, but you survive to plot again.",
            afterNarration:
              "From hiding, you watch your influence fade. Survival keeps you alive, yet the taste of lost control gnaws at you. Planning revenge begins to occupy your restless mind.",
            effects: { life: +10, energy: +10 },
          },
        ],
      },
    ],
    act4: [
      {
        narration:
          "The end has come. Whether feared or despised, your path has left scars across the land.",
        choices: [
          {
            text: "Crown yourself ruler of the ashes.",
            cost: 25,
            outcomeText:
              "Your tyranny is sealed. You are remembered as a cruel despot.",
            afterNarration:
              "Palaces rise amid the ruins, and fear cements your authority. Yet the whispers of the wronged follow you everywhere. Power is yours, but love and trust are forever lost.",
            effects: { life: +10, money: +20 },
          },
          {
            text: "Disappear into legend.",
            cost: 25,
            outcomeText:
              "Stories of your terror echo for generations, though your fate is unknown.",
            afterNarration:
              "You vanish into myth, your deeds told with awe and dread. Though no longer visible, your shadow looms, a reminder that even absence can command fear and admiration.",
            effects: { energy: +10 },
          },
          {
            text: "Seek redemption.",
            cost: 25,
            outcomeText:
              "You lay down your arms, haunted by the past. Few forgive you, but some see change.",
            afterNarration:
              "The first steps toward forgiveness are slow and painful. Each act of goodwill gradually erodes the darkness within and softens resentment around you. Healing is possible, but the journey is long.",
            effects: { life: +20, money: -10 },
          },
        ],
      },
    ],
  },
};
