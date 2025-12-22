// Squirrel Notes - Main Script

// ===== STATE MACHINE =====

// Define all game states
const STATES = {
    IDLE: 'IDLE',
    PLACING_WALNUT: 'PLACING_WALNUT',
    SQUIRREL_ENTERING: 'SQUIRREL_ENTERING',
    SQUIRREL_EATING: 'SQUIRREL_EATING',
    TEXT_BOX_SHOWING: 'TEXT_BOX_SHOWING',
    NOTE_BUTTON_VISIBLE: 'NOTE_BUTTON_VISIBLE',
    READING_NOTE: 'READING_NOTE',
    SQUIRREL_LEAVING: 'SQUIRREL_LEAVING',
    COMPLETE: 'COMPLETE',
    TREE_TRANSITION: 'TREE_TRANSITION',
    TREE_VIEW: 'TREE_VIEW',
    READING_NOTE_TREE: 'READING_NOTE_TREE'
};

// Current state
let currentState = STATES.IDLE;

// Note counter (tracks how many notes have been delivered)
let notesDelivered = 0;

// State transition function
function setState(newState) {
    const previousState = currentState;
    currentState = newState;

    console.log(`[STATE TRANSITION] ${previousState} -> ${newState}`);
    console.log(`[NOTES DELIVERED] ${notesDelivered}/3`);

    // Handle state-specific logic
    handleStateChange(newState);
}

// Handle state changes
function handleStateChange(newState) {
    console.log(`[STATE HANDLER] Entering ${newState}`);

    switch(newState) {
        case STATES.IDLE:
            console.log('  -> Ready for user to place walnut');

            // Show and enable "Place Walnut" button
            if (placeWalnutBtn) {
                placeWalnutBtn.classList.remove('hidden');
                placeWalnutBtn.disabled = false;
            }

            // Hide "Visit Squirrels" button
            if (visitSquirrelsBtn) {
                visitSquirrelsBtn.classList.add('hidden');
            }

            // Ensure everything else is hidden
            if (textBox) {
                textBox.classList.add('hidden');
            }
            if (noteButton) {
                noteButton.classList.add('hidden');
            }
            if (sceneOverlay) {
                sceneOverlay.classList.add('hidden');
            }
            if (noteModal) {
                noteModal.classList.add('hidden');
            }

            // Start character blink animation
            startCharacterBlink();

            break;

        case STATES.PLACING_WALNUT:
            console.log('  -> Character reaching to place walnut');

            // Stop character blink animation
            stopCharacterBlink();

            // Hide the Place Walnut button
            if (placeWalnutBtn) {
                placeWalnutBtn.classList.add('hidden');
            }

            // Immediately swap character to reaching pose and shift left
            if (characterSprite) {
                characterSprite.src = 'assets/sprites/character/main-reaching.png';
                characterSprite.style.left = '48%'; // Shift 2% left from center (50%)
                characterSprite.style.bottom = '12%'; // Lower by 1% during reach
            }

            // Play walnut placement audio immediately, skipping first 0.4 seconds
            const walnutAudio = new Audio('assets/audio/walnut-place-audio.wav');
            walnutAudio.volume = 0.48; // 20% quieter than 0.6
            walnutAudio.currentTime = 0.4; // Skip first 0.4 seconds
            walnutAudio.play().catch(err => {
                console.warn('[AUDIO] Failed to play walnut placement sound:', err);
            });

            // After 0.5 seconds: return to sitting, show walnut
            setTimeout(() => {
                // Swap back to sitting pose and return to center
                if (characterSprite) {
                    characterSprite.src = 'assets/sprites/character/main-sitting.png';
                    characterSprite.style.left = '50%'; // Return to center
                    characterSprite.style.bottom = '13%'; // Return to original position
                }

                // Show the walnut sprite
                if (walnutSprite) {
                    walnutSprite.classList.remove('hidden');
                }

                // After a brief moment, transition to SQUIRREL_ENTERING
                setTimeout(() => {
                    setState(STATES.SQUIRREL_ENTERING);
                }, 300);
            }, 500);

            break;

        case STATES.SQUIRREL_ENTERING:
            console.log('  -> Squirrel hopping from left to center');

            // Restart blink animation for squirrel encounter
            startCharacterBlink();

            animateSquirrelEntering();
            break;

        case STATES.SQUIRREL_EATING:
            console.log('  -> Squirrel eating walnut');

            // Hide the walnut (squirrel picks it up)
            if (walnutSprite) {
                walnutSprite.classList.add('hidden');
            }

            // After squirrel "eats" for a moment, show text box
            setTimeout(() => {
                setState(STATES.TEXT_BOX_SHOWING);
            }, 1000);
            break;

        case STATES.TEXT_BOX_SHOWING:
            console.log('  -> Text box appearing with typewriter effect');
            showTextBoxWithTypewriter("It looks like the squirrel was carrying a note...");
            break;

        case STATES.NOTE_BUTTON_VISIBLE:
            console.log('  -> Note button clickable above character');

            // Show the note button (text box remains visible)
            if (noteButton) {
                noteButton.classList.remove('hidden');
            }

            break;

        case STATES.READING_NOTE:
            console.log('  -> Scene dims, note content displays');

            // Hide text box and note button
            if (textBox) {
                textBox.classList.add('hidden');
            }
            if (noteButton) {
                noteButton.classList.add('hidden');
            }

            // Show overlay to dim scene
            if (sceneOverlay) {
                sceneOverlay.classList.remove('hidden');
            }

            // Display note modal with current note content
            if (noteModal && noteText) {
                noteText.textContent = getCurrentNote();
                noteModal.classList.remove('hidden');
            }

            break;

        case STATES.SQUIRREL_LEAVING:
            console.log('  -> Squirrel hopping off screen to the right');
            animateSquirrelLeaving();
            break;

        case STATES.COMPLETE:
            console.log('  -> All 3 notes delivered, showing Visit Squirrels button');

            // Hide "Place Walnut" button
            if (placeWalnutBtn) {
                placeWalnutBtn.classList.add('hidden');
            }

            // Show and enable "Visit Squirrels" button
            if (visitSquirrelsBtn) {
                visitSquirrelsBtn.classList.remove('hidden');
                visitSquirrelsBtn.disabled = false;
            }

            // Ensure other UI elements are hidden
            if (textBox) {
                textBox.classList.add('hidden');
            }
            if (noteButton) {
                noteButton.classList.add('hidden');
            }
            if (sceneOverlay) {
                sceneOverlay.classList.add('hidden');
            }
            if (noteModal) {
                noteModal.classList.add('hidden');
            }

            // Start blink animation for complete state
            startCharacterBlink();

            break;

        case STATES.TREE_TRANSITION:
            console.log('  -> Fading to tree scene');
            transitionToTreeScene();
            break;

        case STATES.TREE_VIEW:
            console.log('  -> At tree scene with 3 clickable squirrels');

            // Show all three squirrels
            if (treeSquirrelRed) treeSquirrelRed.classList.remove('hidden');
            if (treeSquirrelBlue) treeSquirrelBlue.classList.remove('hidden');
            if (treeSquirrelGreen) treeSquirrelGreen.classList.remove('hidden');

            // Show back to bench button
            if (backToBenchBtn) backToBenchBtn.classList.remove('hidden');

            // Hide overlays and modals
            if (scene2Overlay) scene2Overlay.classList.add('hidden');
            if (noteModalTree) noteModalTree.classList.add('hidden');

            // Start tree squirrel idle animations
            startTreeSquirrelAnimations();

            break;

        case STATES.READING_NOTE_TREE:
            console.log('  -> Reading note from tree scene');

            // Stop tree squirrel idle animations while reading
            stopTreeSquirrelAnimations();

            // Show overlay to dim scene
            if (scene2Overlay) {
                scene2Overlay.classList.remove('hidden');
            }

            // Display note modal with selected note content
            if (noteModalTree && noteTextTree) {
                noteTextTree.textContent = NOTES[currentReadingNoteIndex];
                noteModalTree.classList.remove('hidden');
            }

            break;

        default:
            console.warn(`[WARNING] Unhandled state: ${newState}`);
    }
}

// ===== DOM ELEMENTS =====

let placeWalnutBtn;
let visitSquirrelsBtn;
let walnutSprite;
let squirrelSprite;
let characterSprite;
let textBox;
let textBoxContent;
let noteButton;
let sceneOverlay;
let noteModal;
let noteText;
let doneReadingBtn;

// Scene 2 elements
let scene1;
let scene2;
let treeSquirrelRed;
let treeSquirrelBlue;
let treeSquirrelGreen;
let scene2Overlay;
let noteModalTree;
let noteTextTree;
let doneReadingTreeBtn;
let backToBenchBtn;

// Track which note is being read in tree view
let currentReadingNoteIndex = 0;

// Background audio
let backgroundAudio;
let audioToggleBtn;
let isAudioMuted = false;

// Debounce for tree squirrel clicks
let lastSquirrelClickTime = 0;

// Character blink animation
let blinkInterval = null;

// Tree squirrel idle animations
let treeSquirrelIntervals = {
    red: null,
    blue: null,
    green: null
};

// ===== SQUIRREL TRACKING =====

// Squirrel colors based on note number
const SQUIRREL_COLORS = ['red', 'blue', 'green'];

// Get current squirrel color based on notes delivered
function getCurrentSquirrelColor() {
    return SQUIRREL_COLORS[notesDelivered];
}

// ===== NOTE CONTENT =====

const NOTES = [
    // Note 1 (Red Squirrel)
    `Merry Christmas Alejandra! 
    Hopefully the painting survived the US Postal service. If it didn't just let me know. I hope you're enjoying your time back home and are living the Midwest holiday dream!
First off, I have to confess to you that I am not a godlike coder, and this is mostly done with AI. Please forgive my insolence, but I was struck with the idea for making this and did not have the abilities myself. That being said, this website was super fun to make and I hope is a fun gift to receive :)

What follows will be a little thank you message and then my review of the Bell Jar!

Merry Christmas!`,

    // Note 2 (Blue Squirrel)
    `I know I write you a lot of things, but there are a lot of things I want to tell you and I can't yap with you in person right now, so this is my loving substitute:
______
You have lit my soul ablaze, Alejandra. 
The very way I walk through life and engage with Being has been changed by spending time with you.
For most of my life, I've felt life was like a bunch of people wandering aimlessly through a thick fog with nothing but flashlights and fear. You may see a column of light beam through, or the shadow it carries along it, but the people emitting the lights keep themselves hidden, afraid to touch the world they inhabit directly. The goal of it all was to cautiously map out the world hidden by the fog and avoid getting hurt in the process. "That's just the way life is," people would say. I didn't like that much; the thought of living so reserved always brought a kind of existential sadness to me. Why waste your one chance at interacting with such a magical world by being afraid of it and trying to withdraw from it? I'd much rather embrace it and try to feel as much of its magic as I can before my time is up. However, that's much easier said than done. Luckily for me, being friends with you has helped me feel life's magic. You took your flashlight and shoved it right into my face and blinded me! But, when my eyes refocused, the fog was gone, my hesitance to grasp at the world around me was gone, and I could see how unimaginably VAST life and Being were.
______
I've never been so excited to live.
______
Now, I am not so naive as to think I have seen you in your entirety or complete authenticity (yet?), but the way you express yourself with the awareness of your own reservations is its own inspiring kind of authenticity. It's as if your reaction to a shadow crossing the fog is the most wholesome, loving curiosity rather than fear and self preservation. You don't tiptoe forward, you strut. No, no, not even a strut, you dance through the world. You meet a gauntlet of experiences and face it head-on so you can know what it feels like to get knocked down and get back up rather than to stay on your feet by avoiding things.
I think that is the most beautiful way to live, and seeing your example helped the budding confidence in my soul to live this way take root. So, thank you. From the bottom of my heart, thank you for helping me learn how to live the way I've always wanted to. Thank you for letting me be a part of your life and making the time to have engaging talks about literally whatever with me. Thank you for being the loving, wise, thoughtful, brilliant, hardworking, capable, funny, and genuine person you are. I respect and admire you more than you know.

I love you Alejandra.

With adoration,
Micah`,

    // Note 3 (Green Squirrel)
    `"I am I am I am."

This is the line which stuck with me the strongest from the book. It appears twice; on page 152 as a mantra to accompany the thunder of her heartbeat which races as she swims toward a rock she never means to reach, and again on page 233 to center herself when gazing out at the cemetery while attending Joan's funeral. I have had my own history with this mantra as part of some meditation techniques, but the appearance of the line first as a comfort while seeking the end of her own life, and again as a comfort while confronted with the death of a friend carries a far richer meaning than my usage—if you ask me. When I meditate with this mantra, it is to focus myself downward to the foundation of Being and experience the quiet which comes with such low elevations of consciousness. This bears its own merit, insights, and weight, of course, as a means to reinforce my relationship with Being so that all higher levels of consciousness and experience can benefit from a reinforced base. Yet, the idea of this mantra arising as a response to an imminent contact with death fascinates me. My memory of my own experience is generally poor, but—as I told you about recently—my own encounter with drowning did not bring forth this comfort. Life was not affirmed to myself in that situation; instead, I was consumed by the presence of death and the possibility of my absence, not am-ing if you will. I'm not sure that I really understand where I'm going with this idea, but I can't deny something within it strikes me. Perhaps I wonder if my own lack of encounter with this life-affirming reaction to death means something, an—if it does—what? Could it be that I don't have a close enough connection to the essence of death for my Being to react with the affirmation of life? Or, is it that I have gone deep enough by meditation that the division between life and death has lifted its illusory image and they no longer stand in opposition to one another and therefore incite no reaction from one another? I truly cannot say, but both ideas are interesting to think about.
______
Beyond the thought of death, many things about the way she lived resonated with me. I'd say there were three main themes which I felt reflected some of my own life: insatiability, manipulation, and self-sabotage. 
______
My favorite song from The Greatest Showman is "Never Enough," and my favorite song from Hamilton is "Satisfied." Growing up, I had an endless stream of fleeting interests like: cooking, baking, poetry, fiction, drawing, painting, digital animation, stop-motion animation, oceanography, piano, dance, yoga, and a few others which I'm sure my mom remembers better than me. Esther's desire to be and do everything in life, then, was incredibly relatable to me on a basic level. I've often felt quite silly for having this insatiability because everyone around me seemed to perpetuate this societal idea of "specialization." I never much cared for that in principle, but over time, the practical realities became clear to me that specialization was rewarded by the existing systems. It was nice to hear my disposition to insatiability reflected in the Bell Jar. Whether it is a good or bad, useful or detrimental, or any other kind of thing to have this disposition is not of importance to me. Simply put, I'm glad I got to hear someone else say it like it was okay. It made me feel better.
______
As far as the plot is concerned, the anecdote about Esther manipulating her college faculty into letting her not be graded for the chemistry class on the basis of her studious reputation and passion for other subjects was fairly benign and unimportant. Yet, to me, this felt like one of the most important parts of the story. I've always been an expressive person, and early on learned that I could tailor my presentation of this expressiveness to look like passion for something and that passion for something was supported or rewarded by others. The story about the chemistry class embodied this, but the impactful part was the personal feeling of deception that Esther felt. I'll be the first to admit that I have used this same pattern of deception many times over the course of my life, but never before had I heard someone else articulate the shame of it. In my experience, whenever I would bring up this behavior of mine to others (primarily Andrew), they would praise me for it and say that I was "making the most of my talents." There was no room to take my shame seriously in this praise. This has left me with a feeling that is real, but seems to have no place to stand. I could rant at this point about the ways in which the systems that constitute our society reward manipulation of others and how morally bankrupt that is, but I do that enough and would rather just show appreciation to Sylvia Plath for writing a pseudo-biographical character who shares the shameful reaction to manipulations society sees as clever. I think it's dreadfully important for people to hear ideas which go against the dominant ideas of a society for both cultural and personal reasons. Thank you for showing me a book which reminds me of what humanity feels like in a largely inhumane society.
______
The last theme which stuck out to me was self-sabotage rooted in a belief that one does not deserve to be happy. Narrative wise, the moment that first shows this—in my opinion—is after her return from New York when she finds out that she didn't get into the writing program she had planned on. Then, when she called her friend who she intended to move in with to tell her the news, the friend urges her to move there anyways and they'll figure something out, but Esther denies the offer. The regret she feels after making that decision and the beginnings of her negative spiraling after that decision read to me as self-sabotage rooted in a belief she does not deserve happiness. These are feelings with which I am intimately familiar. I would guess that—for me—these feelings were a product of growing up with minimal community and strong habits of judgment and separation filling that void, but one ought to never be too certain. Regardless, a deep rooted sense that I don't deserve to be happy took root a long time ago and manifested in all manners of self-sabotage—especially throughout my high school years. I am actually writing this shortly after the piece I shared with you on my relationship with fear, so exposition on how my self-worth has evolved in recent years feels redundant. That being said, the detail and rawness with which these kinds of thoughts are portrayed in the Bell Jar is beautifully real.
______
In conclusion, the Bell Jar is the most personally raw, real, and honest depiction of the complexities of the interior experience of a person—in my opinion. Thank you for sharing it with me, I thoroughly enjoyed it.

Lovingly,
Micah`
];

// Get current note text based on notes delivered
function getCurrentNote() {
    return NOTES[notesDelivered];
}

// ===== ANIMATION FUNCTIONS =====

function transitionToTreeScene() {
    if (!scene1 || !scene2) return;

    console.log('  -> Starting fade transition to tree scene');

    // Ensure tree squirrel animations are stopped before starting fresh
    stopTreeSquirrelAnimations();

    // Fade out scene 1
    scene1.classList.add('fading-out');

    // After fade out completes (0.5s), switch scenes
    setTimeout(() => {
        // Hide scene 1
        scene1.classList.remove('active');
        scene1.classList.remove('fading-out');

        // Show scene 2 with fade in
        scene2.classList.add('active');
        scene2.classList.add('fading-in');

        // Force reflow to ensure fading-in class is applied before removing it
        scene2.offsetHeight;

        // Trigger fade in by removing the class
        setTimeout(() => {
            scene2.classList.remove('fading-in');

            // After fade in completes, transition to TREE_VIEW
            setTimeout(() => {
                setState(STATES.TREE_VIEW);
            }, 500);
        }, 50);
    }, 500);
}

function transitionToBenchScene() {
    if (!scene1 || !scene2) return;

    console.log('  -> Starting fade transition back to bench scene');

    // Stop tree squirrel animations before leaving tree scene
    stopTreeSquirrelAnimations();

    // Fade out scene 2
    scene2.classList.add('fading-out');

    // After fade out completes (0.5s), switch scenes
    setTimeout(() => {
        // Hide scene 2
        scene2.classList.remove('active');
        scene2.classList.remove('fading-out');

        // Hide tree elements
        if (treeSquirrelRed) treeSquirrelRed.classList.add('hidden');
        if (treeSquirrelBlue) treeSquirrelBlue.classList.add('hidden');
        if (treeSquirrelGreen) treeSquirrelGreen.classList.add('hidden');
        if (backToBenchBtn) backToBenchBtn.classList.add('hidden');

        // Show scene 1 with fade in
        scene1.classList.add('active');
        scene1.classList.add('fading-in');

        // Force reflow
        scene1.offsetHeight;

        // Trigger fade in
        setTimeout(() => {
            scene1.classList.remove('fading-in');

            // After fade in completes, transition to COMPLETE
            setTimeout(() => {
                setState(STATES.COMPLETE);
            }, 500);
        }, 50);
    }, 500);
}

function showTextBoxWithTypewriter(text) {
    if (!textBox || !textBoxContent) return;

    // Show the text box
    textBox.classList.remove('hidden');

    // Play text box appear sound
    playSoundEffect('assets/audio/text-box-appear-audio.mp3', 0.5);

    // Clear previous content
    textBoxContent.textContent = '';

    // Play typing audio in a loop
    const typingAudio = new Audio('assets/audio/text-box-typing-audio.wav');
    typingAudio.loop = true;
    typingAudio.play().catch(err => {
        console.warn('[AUDIO] Failed to play text box typing sound:', err);
    });

    // Typewriter effect
    let currentChar = 0;
    const typingInterval = setInterval(() => {
        if (currentChar < text.length) {
            textBoxContent.textContent += text[currentChar];
            currentChar++;
        } else {
            // Typing complete
            clearInterval(typingInterval);

            // Stop typing audio
            typingAudio.pause();
            typingAudio.currentTime = 0;

            // Wait 0.5 seconds then transition to NOTE_BUTTON_VISIBLE
            setTimeout(() => {
                setState(STATES.NOTE_BUTTON_VISIBLE);
            }, 500);
        }
    }, 50); // 50ms per character
}

function animateSquirrelEntering() {
    if (!squirrelSprite) return;

    const squirrelColor = getCurrentSquirrelColor();
    console.log(`  -> Using squirrel color: ${squirrelColor}`);

    // Show squirrel sprite
    squirrelSprite.classList.remove('hidden');

    // Start at off-screen left position
    squirrelSprite.style.left = '-10%';

    // Set initial hop frame
    let currentFrame = 1;
    squirrelSprite.src = `assets/sprites/squirrels/squirrel-${squirrelColor}-hop-${currentFrame}.png`;

    // Play hopping audio (will play only during movement)
    const hoppingAudio = new Audio('assets/audio/squirrel-hopping-audio.wav');
    hoppingAudio.play().catch(err => {
        console.warn('[AUDIO] Failed to play squirrel hopping sound:', err);
    });

    // Animate frame cycling (4 frames over ~0.4s = 100ms per frame)
    const frameInterval = setInterval(() => {
        currentFrame = (currentFrame % 4) + 1; // Cycle 1-4
        squirrelSprite.src = `assets/sprites/squirrels/squirrel-${squirrelColor}-hop-${currentFrame}.png`;
    }, 100);

    // Start movement to center (near walnut)
    // Use setTimeout to ensure CSS transition applies
    setTimeout(() => {
        squirrelSprite.style.transition = 'left 2s linear';
        squirrelSprite.style.left = '45%'; // Same position as walnut
    }, 50);

    // After 2 seconds, stop animation and transition to eating
    setTimeout(() => {
        // Stop frame cycling
        clearInterval(frameInterval);

        // Stop hopping audio
        hoppingAudio.pause();
        hoppingAudio.currentTime = 0;

        // Switch to idle sprite
        squirrelSprite.src = `assets/sprites/squirrels/squirrel-${squirrelColor}-idle.png`;

        // Transition to SQUIRREL_EATING
        setState(STATES.SQUIRREL_EATING);
    }, 2000);
}

function animateSquirrelLeaving() {
    if (!squirrelSprite) return;

    const squirrelColor = getCurrentSquirrelColor();
    console.log(`  -> Squirrel ${squirrelColor} leaving to the right`);

    // Ensure overlay and modal are hidden
    if (sceneOverlay) {
        sceneOverlay.classList.add('hidden');
    }
    if (noteModal) {
        noteModal.classList.add('hidden');
    }

    // Walnut already disappeared during SQUIRREL_EATING, but ensure it's hidden
    if (walnutSprite) {
        walnutSprite.classList.add('hidden');
    }

    // Start at current center position
    squirrelSprite.style.left = '45%';

    // Set initial hop frame
    let currentFrame = 1;
    squirrelSprite.src = `assets/sprites/squirrels/squirrel-${squirrelColor}-hop-${currentFrame}.png`;

    // Play hopping audio
    const hoppingAudio = new Audio('assets/audio/squirrel-hopping-audio.wav');
    hoppingAudio.play().catch(err => {
        console.warn('[AUDIO] Failed to play squirrel hopping sound:', err);
    });

    // Animate frame cycling (4 frames over ~0.4s = 100ms per frame)
    const frameInterval = setInterval(() => {
        currentFrame = (currentFrame % 4) + 1; // Cycle 1-4
        squirrelSprite.src = `assets/sprites/squirrels/squirrel-${squirrelColor}-hop-${currentFrame}.png`;
    }, 100);

    // Start movement to right (off-screen)
    setTimeout(() => {
        squirrelSprite.style.transition = 'left 2s linear';
        squirrelSprite.style.left = '110%'; // Off-screen right
    }, 50);

    // After 2 seconds, stop animation and transition to next state
    setTimeout(() => {
        // Stop frame cycling
        clearInterval(frameInterval);

        // Stop hopping audio
        hoppingAudio.pause();
        hoppingAudio.currentTime = 0;

        // Hide squirrel
        squirrelSprite.classList.add('hidden');

        // Increment note counter
        notesDelivered++;
        console.log(`  -> Note delivered! Total notes: ${notesDelivered}/3`);

        // Transition to next state based on notes delivered
        if (notesDelivered < 3) {
            // More notes to deliver, return to IDLE
            setState(STATES.IDLE);
        } else {
            // All 3 notes delivered, go to COMPLETE
            setState(STATES.COMPLETE);
        }
    }, 2000);
}

// ===== CHARACTER BLINK ANIMATION =====

// States where the character can blink (sitting still with main-sitting sprite)
const BLINK_ALLOWED_STATES = [
    STATES.IDLE,
    STATES.SQUIRREL_ENTERING,
    STATES.SQUIRREL_EATING,
    STATES.TEXT_BOX_SHOWING,
    STATES.NOTE_BUTTON_VISIBLE,
    STATES.SQUIRREL_LEAVING,
    STATES.COMPLETE
];

function startCharacterBlink() {
    // Clear any existing interval
    if (blinkInterval) {
        clearInterval(blinkInterval);
    }

    // Function to perform a single blink
    const doBlink = () => {
        if (characterSprite && BLINK_ALLOWED_STATES.includes(currentState)) {
            // Swap to blink sprite
            characterSprite.src = 'assets/sprites/character/main-sitting-blink.png';

            // After 150ms, swap back to sitting
            setTimeout(() => {
                if (characterSprite && BLINK_ALLOWED_STATES.includes(currentState)) {
                    characterSprite.src = 'assets/sprites/character/main-sitting.png';
                }
            }, 150);
        }
    };

    // Start blinking with random intervals between 3-4 seconds
    const scheduleNextBlink = () => {
        const delay = 3000 + Math.random() * 1000; // 3000-4000ms
        blinkInterval = setTimeout(() => {
            doBlink();
            scheduleNextBlink(); // Schedule the next blink
        }, delay);
    };

    scheduleNextBlink();
}

function stopCharacterBlink() {
    if (blinkInterval) {
        clearTimeout(blinkInterval);
        blinkInterval = null;
    }
}

// ===== TREE SQUIRREL IDLE ANIMATIONS =====

function animateTreeSquirrel(color, element, initialDelay = 0) {
    if (!element) return;

    // Animation sequence: hop-1 (200ms) -> hop-3 (400ms) -> hop-1 (200ms) -> idle
    const doAnimation = () => {
        if (element && currentState === STATES.TREE_VIEW) {
            // Step 1: hop-1 for 200ms (15% larger)
            element.src = `assets/sprites/squirrels/squirrel-${color}-hop-1.png`;
            element.style.transform = 'scale(1.15)';

            setTimeout(() => {
                if (element && currentState === STATES.TREE_VIEW) {
                    // Step 2: hop-3 for 400ms (15% larger)
                    element.src = `assets/sprites/squirrels/squirrel-${color}-hop-3.png`;
                    element.style.transform = 'scale(1.15)';

                    setTimeout(() => {
                        if (element && currentState === STATES.TREE_VIEW) {
                            // Step 3: hop-1 for 200ms (15% larger)
                            element.src = `assets/sprites/squirrels/squirrel-${color}-hop-1.png`;
                            element.style.transform = 'scale(1.15)';

                            setTimeout(() => {
                                if (element && currentState === STATES.TREE_VIEW) {
                                    // Step 4: back to idle (normal size)
                                    element.src = `assets/sprites/squirrels/squirrel-${color}-idle.png`;
                                    element.style.transform = 'scale(1)';
                                }
                            }, 200);
                        }
                    }, 400);
                }
            }, 200);
        }
    };

    // Schedule animations with random intervals between 10-12 seconds
    const scheduleNextAnimation = () => {
        const delay = 10000 + Math.random() * 2000; // 10000-12000ms
        treeSquirrelIntervals[color] = setTimeout(() => {
            doAnimation();
            scheduleNextAnimation(); // Schedule the next animation
        }, delay);
    };

    // Start with initial delay, then schedule subsequent animations
    treeSquirrelIntervals[color] = setTimeout(() => {
        doAnimation();
        scheduleNextAnimation();
    }, initialDelay);
}

function startTreeSquirrelAnimations() {
    // Stop any existing animations
    stopTreeSquirrelAnimations();

    // Start animations for each squirrel with 4-second offsets
    animateTreeSquirrel('red', treeSquirrelRed, 0);      // Starts immediately
    animateTreeSquirrel('blue', treeSquirrelBlue, 8000);  // Starts after 8 seconds
    animateTreeSquirrel('green', treeSquirrelGreen, 4000); // Starts after 4 seconds
}

function stopTreeSquirrelAnimations() {
    // Clear all intervals
    if (treeSquirrelIntervals.red) {
        clearTimeout(treeSquirrelIntervals.red);
        treeSquirrelIntervals.red = null;
    }
    if (treeSquirrelIntervals.blue) {
        clearTimeout(treeSquirrelIntervals.blue);
        treeSquirrelIntervals.blue = null;
    }
    if (treeSquirrelIntervals.green) {
        clearTimeout(treeSquirrelIntervals.green);
        treeSquirrelIntervals.green = null;
    }

    // Reset to idle sprites and normal size
    if (treeSquirrelRed) {
        treeSquirrelRed.src = 'assets/sprites/squirrels/squirrel-red-idle.png';
        treeSquirrelRed.style.transform = 'scale(1)';
    }
    if (treeSquirrelBlue) {
        treeSquirrelBlue.src = 'assets/sprites/squirrels/squirrel-blue-idle.png';
        treeSquirrelBlue.style.transform = 'scale(1)';
    }
    if (treeSquirrelGreen) {
        treeSquirrelGreen.src = 'assets/sprites/squirrels/squirrel-green-idle.png';
        treeSquirrelGreen.style.transform = 'scale(1)';
    }
}

// ===== AUDIO HELPERS =====

// Create and play a sound effect with appropriate volume
function playSoundEffect(src, volume = 0.7) {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(err => {
        console.warn(`[AUDIO] Failed to play sound effect ${src}:`, err);
    });
    return audio;
}

// ===== BACKGROUND AUDIO =====

function initBackgroundAudio() {
    // Create background audio element
    backgroundAudio = new Audio('assets/audio/background-audio-loop.wav');
    backgroundAudio.loop = true;
    backgroundAudio.volume = 0; // Start at 0 for fade in

    // Try to start playing and fade in
    backgroundAudio.play().then(() => {
        console.log('[AUDIO] Background audio started');
        // Fade in audio over 0.5 seconds to 40% volume (quieter than sound effects)
        fadeAudioVolume(backgroundAudio, 0, 0.4, 500);
    }).catch(err => {
        console.warn('[AUDIO] Background audio autoplay blocked:', err);
        // User will need to click the toggle button to start
    });
}

function toggleBackgroundAudio() {
    if (!backgroundAudio || !audioToggleBtn) return;

    isAudioMuted = !isAudioMuted;

    if (isAudioMuted) {
        // Mute - fade out
        console.log('[AUDIO] Muting background audio');
        fadeAudioVolume(backgroundAudio, backgroundAudio.volume, 0, 500);
        audioToggleBtn.textContent = '🔇';
    } else {
        // Unmute - fade in
        console.log('[AUDIO] Unmuting background audio');

        // Ensure audio is playing
        if (backgroundAudio.paused) {
            backgroundAudio.play().catch(err => {
                console.warn('[AUDIO] Failed to play background audio:', err);
            });
        }

        // Fade to 40% volume (quieter than sound effects)
        fadeAudioVolume(backgroundAudio, backgroundAudio.volume, 0.4, 500);
        audioToggleBtn.textContent = '🔊';
    }
}

function fadeAudioVolume(audio, startVolume, endVolume, duration) {
    if (!audio) return;

    const startTime = Date.now();
    const volumeDiff = endVolume - startVolume;

    function updateVolume() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-in-out function for smoother transition
        const easedProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        audio.volume = Math.max(0, Math.min(1, startVolume + volumeDiff * easedProgress));

        if (progress < 1) {
            requestAnimationFrame(updateVolume);
        }
    }

    updateVolume();
}

// ===== INITIALIZATION =====

function init() {
    console.log('[INIT] Squirrel Notes starting...');
    console.log(`[INIT] Initial state: ${currentState}`);

    // Initialize background audio
    initBackgroundAudio();

    // Get DOM elements - Scene 1
    placeWalnutBtn = document.getElementById('place-walnut-btn');
    visitSquirrelsBtn = document.getElementById('visit-squirrels-btn');
    walnutSprite = document.getElementById('walnut');
    squirrelSprite = document.getElementById('squirrel');
    characterSprite = document.getElementById('character');
    textBox = document.getElementById('text-box');
    textBoxContent = document.getElementById('text-box-content');
    noteButton = document.getElementById('note-button');
    sceneOverlay = document.getElementById('scene-overlay');
    noteModal = document.getElementById('note-modal');
    noteText = document.getElementById('note-text');
    doneReadingBtn = document.getElementById('done-reading-btn');

    // Get DOM elements - Scenes
    scene1 = document.getElementById('scene-1');
    scene2 = document.getElementById('scene-2');

    // Get DOM elements - Scene 2
    treeSquirrelRed = document.getElementById('tree-squirrel-red');
    treeSquirrelBlue = document.getElementById('tree-squirrel-blue');
    treeSquirrelGreen = document.getElementById('tree-squirrel-green');
    scene2Overlay = document.getElementById('scene-2-overlay');
    noteModalTree = document.getElementById('note-modal-tree');
    noteTextTree = document.getElementById('note-text-tree');
    doneReadingTreeBtn = document.getElementById('done-reading-tree-btn');
    backToBenchBtn = document.getElementById('back-to-bench-btn');

    // Wire up button events
    if (placeWalnutBtn) {
        placeWalnutBtn.addEventListener('click', onPlaceWalnutClick);
        console.log('[INIT] Place Walnut button event listener attached');
    } else {
        console.error('[INIT] Place Walnut button not found!');
    }

    if (visitSquirrelsBtn) {
        visitSquirrelsBtn.addEventListener('click', onVisitSquirrelsClick);
        console.log('[INIT] Visit Squirrels button event listener attached');
    } else {
        console.error('[INIT] Visit Squirrels button not found!');
    }

    if (noteButton) {
        noteButton.addEventListener('click', onNoteButtonClick);
        console.log('[INIT] Note button event listener attached');
    } else {
        console.error('[INIT] Note button not found!');
    }

    if (doneReadingBtn) {
        doneReadingBtn.addEventListener('click', onDoneReadingClick);
        console.log('[INIT] Done Reading button event listener attached');
    } else {
        console.error('[INIT] Done Reading button not found!');
    }

    // Wire up tree scene events
    if (treeSquirrelRed) {
        treeSquirrelRed.addEventListener('click', () => onTreeSquirrelClick(0));
    }
    if (treeSquirrelBlue) {
        treeSquirrelBlue.addEventListener('click', () => onTreeSquirrelClick(1));
    }
    if (treeSquirrelGreen) {
        treeSquirrelGreen.addEventListener('click', () => onTreeSquirrelClick(2));
    }

    if (doneReadingTreeBtn) {
        doneReadingTreeBtn.addEventListener('click', onDoneReadingTreeClick);
        console.log('[INIT] Done Reading Tree button event listener attached');
    } else {
        console.error('[INIT] Done Reading Tree button not found!');
    }

    if (backToBenchBtn) {
        backToBenchBtn.addEventListener('click', onBackToBenchClick);
        console.log('[INIT] Back to Bench button event listener attached');
    } else {
        console.error('[INIT] Back to Bench button not found!');
    }

    // Wire up audio toggle button
    audioToggleBtn = document.getElementById('audio-toggle-btn');
    if (audioToggleBtn) {
        audioToggleBtn.addEventListener('click', toggleBackgroundAudio);
        console.log('[INIT] Audio toggle button event listener attached');
    } else {
        console.error('[INIT] Audio toggle button not found!');
    }

    console.log('[INIT] Ready!');

    // Trigger initial state handler to start blink animation
    handleStateChange(currentState);
}

// ===== EVENT HANDLERS =====

function onPlaceWalnutClick() {
    console.log('[EVENT] Place Walnut button clicked');

    if (currentState === STATES.IDLE) {
        // Disable button to prevent rapid clicks
        if (placeWalnutBtn) {
            placeWalnutBtn.disabled = true;
        }

        setState(STATES.PLACING_WALNUT);
    } else {
        console.warn('[EVENT] Place Walnut clicked but not in IDLE state');
    }
}

function onNoteButtonClick() {
    console.log('[EVENT] Note button clicked');

    if (currentState === STATES.NOTE_BUTTON_VISIBLE) {
        // Hide note button immediately to prevent double-clicks
        if (noteButton) {
            noteButton.style.pointerEvents = 'none';
        }

        // Play note open audio
        playSoundEffect('assets/audio/note-open-audio.wav', 0.6);

        // Transition to READING_NOTE
        setState(STATES.READING_NOTE);

        // Re-enable after a short delay
        setTimeout(() => {
            if (noteButton) {
                noteButton.style.pointerEvents = 'auto';
            }
        }, 300);
    } else {
        console.warn('[EVENT] Note button clicked but not in NOTE_BUTTON_VISIBLE state');
    }
}

function onDoneReadingClick() {
    console.log('[EVENT] Done Reading button clicked');

    if (currentState === STATES.READING_NOTE) {
        // Hide note modal and overlay
        if (noteModal) {
            noteModal.classList.add('hidden');
        }
        if (sceneOverlay) {
            sceneOverlay.classList.add('hidden');
        }

        // Transition to SQUIRREL_LEAVING
        setState(STATES.SQUIRREL_LEAVING);
    } else {
        console.warn('[EVENT] Done Reading clicked but not in READING_NOTE state');
    }
}

function onVisitSquirrelsClick() {
    console.log('[EVENT] Visit Squirrels button clicked');

    if (currentState === STATES.COMPLETE) {
        // Disable button to prevent rapid clicks
        if (visitSquirrelsBtn) {
            visitSquirrelsBtn.disabled = true;
        }

        // Transition to TREE_TRANSITION
        setState(STATES.TREE_TRANSITION);
    } else {
        console.warn('[EVENT] Visit Squirrels clicked but not in COMPLETE state');
    }
}

function onTreeSquirrelClick(noteIndex) {
    console.log(`[EVENT] Tree squirrel clicked - note index: ${noteIndex}`);

    // Debounce - prevent clicks within 500ms
    const now = Date.now();
    if (now - lastSquirrelClickTime < 500) {
        console.log('[EVENT] Tree squirrel click debounced (too fast)');
        return;
    }
    lastSquirrelClickTime = now;

    if (currentState === STATES.TREE_VIEW) {
        // Set which note to read
        currentReadingNoteIndex = noteIndex;

        // Play note open audio
        playSoundEffect('assets/audio/note-open-audio.wav', 0.6);

        // Transition to READING_NOTE_TREE
        setState(STATES.READING_NOTE_TREE);
    } else {
        console.warn('[EVENT] Tree squirrel clicked but not in TREE_VIEW state');
    }
}

function onDoneReadingTreeClick() {
    console.log('[EVENT] Done Reading Tree button clicked');

    if (currentState === STATES.READING_NOTE_TREE) {
        // Hide note modal and overlay
        if (noteModalTree) {
            noteModalTree.classList.add('hidden');
        }
        if (scene2Overlay) {
            scene2Overlay.classList.add('hidden');
        }

        // Return to TREE_VIEW
        setState(STATES.TREE_VIEW);
    } else {
        console.warn('[EVENT] Done Reading Tree clicked but not in READING_NOTE_TREE state');
    }
}

function onBackToBenchClick() {
    console.log('[EVENT] Back to Bench button clicked');

    if (currentState === STATES.TREE_VIEW) {
        // Transition back to bench scene
        transitionToBenchScene();
    } else {
        console.warn('[EVENT] Back to Bench clicked but not in TREE_VIEW state');
    }
}

// ===== ASSET PRELOADING =====

const ASSETS = {
    images: [
        // Backgrounds
        'assets/backgrounds/main-scene-background.png',
        'assets/backgrounds/second-scene-background.png',

        // Character sprites
        'assets/sprites/character/main-sitting.png',
        'assets/sprites/character/main-sitting-blink.png',
        'assets/sprites/character/main-reaching.png',

        // Squirrel sprites - red
        'assets/sprites/squirrels/squirrel-red-idle.png',
        'assets/sprites/squirrels/squirrel-red-hop-1.png',
        'assets/sprites/squirrels/squirrel-red-hop-2.png',
        'assets/sprites/squirrels/squirrel-red-hop-3.png',
        'assets/sprites/squirrels/squirrel-red-hop-4.png',

        // Squirrel sprites - blue
        'assets/sprites/squirrels/squirrel-blue-idle.png',
        'assets/sprites/squirrels/squirrel-blue-hop-1.png',
        'assets/sprites/squirrels/squirrel-blue-hop-2.png',
        'assets/sprites/squirrels/squirrel-blue-hop-3.png',
        'assets/sprites/squirrels/squirrel-blue-hop-4.png',

        // Squirrel sprites - green
        'assets/sprites/squirrels/squirrel-green-idle.png',
        'assets/sprites/squirrels/squirrel-green-hop-1.png',
        'assets/sprites/squirrels/squirrel-green-hop-2.png',
        'assets/sprites/squirrels/squirrel-green-hop-3.png',
        'assets/sprites/squirrels/squirrel-green-hop-4.png',

        // Item sprites
        'assets/sprites/items/backpack.png',
        'assets/sprites/items/walnut.png',
        'assets/sprites/items/note.png'
    ],
    audio: [
        'assets/audio/background-audio-loop.wav',
        'assets/audio/walnut-place-audio.wav',
        'assets/audio/squirrel-hopping-audio.wav',
        'assets/audio/text-box-appear-audio.mp3',
        'assets/audio/text-box-typing-audio.wav',
        'assets/audio/note-open-audio.wav'
    ]
};

function preloadAssets() {
    return new Promise((resolve) => {
        let loadedCount = 0;
        const totalAssets = ASSETS.images.length + ASSETS.audio.length;

        console.log(`[PRELOAD] Loading ${totalAssets} assets...`);

        const checkComplete = () => {
            loadedCount++;
            console.log(`[PRELOAD] Progress: ${loadedCount}/${totalAssets}`);

            if (loadedCount === totalAssets) {
                console.log('[PRELOAD] All assets loaded!');
                resolve();
            }
        };

        // Preload images
        ASSETS.images.forEach(src => {
            const img = new Image();
            img.onload = checkComplete;
            img.onerror = () => {
                console.warn(`[PRELOAD] Failed to load image: ${src}`);
                checkComplete();
            };
            img.src = src;
        });

        // Preload audio
        ASSETS.audio.forEach(src => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                checkComplete();
                // Remove listener after first call
                audio.oncanplaythrough = null;
            };
            audio.onerror = () => {
                console.warn(`[PRELOAD] Failed to load audio: ${src}`);
                checkComplete();
            };
            audio.src = src;
        });
    });
}

function startGame() {
    const loadingScreen = document.getElementById('loading-screen');
    const gameContainer = document.getElementById('game-container');

    console.log('[GAME] Starting game...');

    // Fade out loading screen
    loadingScreen.classList.add('fade-out');

    setTimeout(() => {
        loadingScreen.style.display = 'none';
        gameContainer.classList.remove('hidden');

        // Initialize the game
        init();
    }, 500);
}

// ===== START THE GAME =====

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        preloadAssets().then(startGame);
    });
} else {
    preloadAssets().then(startGame);
}
