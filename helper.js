/* Sound It Out: the guided helper ("Need help choosing?").
   One file, no dependencies, no network calls, no tracking. Nothing a visitor taps or types leaves the browser.
   Wire it in with one tag before </body>:   <script src="/helper.js" defer></script>
   (from a page in a folder: src="../helper.js"). Links are built from the folder this file is served from.

   EVERYTHING YOU MAY WANT TO CHANGE IS IN "DATA" BELOW. The code under the line "LOGIC" never needs editing.
   A page is always written as its address without slashes, for example 'cvc-word-generator'.
   After any change run:  node test.mjs            (checks every page against the sitemap)
                          node test.mjs --tree     (writes TREE.md again from this file)            */
var SIOH_DATA = {

  /* ---------- words on the button and the panel ---------- */
  text: {
    button: 'Need help choosing?',
    title: 'Need help choosing?',
    hello: 'Three quick taps and I will point you to one page. Nothing you tap or type here is sent anywhere.',
    who: 'Who are you helping?',
    age: 'How old is your child?',
    problem: 'What is happening when your child reads?',
    more: 'Which one is closest?',
    grade: 'Which grade do you teach?',
    need: 'What do you need today?',
    search: 'What are you looking for?',
    searchHint: 'Type a word or two, for example: bingo, sight words, tracing.',
    searchNote: 'The search runs on this page. Nothing you type is sent anywhere.',
    searchNone: 'No page has that name. Try one word, such as "tracing".',
    top: 'Five makers to start with',
    startHere: 'Start here',
    checkTag: 'Free · 3 minutes · No sign-up',
    checkEnd: 'The check points to the likely reason, so you know where to start.',
    nextLead: 'If the check agrees, the next step is',
    planEnd: 'a 10-day plan. $19, one payment, 30-day money back. No need to decide now.',
    freeLead: 'Or try this, free',
    alsoLead: 'Also useful',
    paidLead: 'Want it all in one file?',
    picksLead: 'Three free pages that fit',
    fine: 'This is a starting point, not a diagnosis and not a promise.',
    again: 'Start again',
    back: 'Back',
    close: 'Close',
    allPrintables: 'See all printables',
    allMakers: 'See all makers',
    hide: 'Hide this button for this visit',
    here: 'you are on this page',
    you: 'You said'
  },

  /* "see everything" links shown at the end of every path */
  everything: { printables: 'printables', makers: 'free-worksheet-maker' },

  /* never show the helper on these addresses (the private plan pages a buyer opens) */
  hideOn: /^p\//,

  /* ---------- first question ---------- */
  who: [
    { id: 'parent', label: 'A parent, with my own child' },
    { id: 'teacher', label: 'A teacher or tutor, with a class or group' },
    { id: 'print', label: 'Just looking for a printable' }
  ],

  /* ---------- the ten difficulties: each has a free check and a 10-day plan (same pairs as funnel.mjs on the site) ---------- */
  plans: {
    ears: { check: 'why-cant-my-child-hear-the-sounds-in-words', ask: 'Why can’t my child hear the sounds in words?', plan: 'ears-first-10-day-listening-plan', name: 'Ears First' },
    ltrs: { check: 'why-cant-my-child-remember-letter-sounds', ask: 'Why can’t my child remember letter sounds?', plan: 'eight-sounds-that-stay-10-day-plan', name: 'Eight Sounds That Stay' },
    fstw: { check: 'why-cant-my-child-blend-sounds', ask: 'Why can’t my child blend sounds?', plan: 'from-sounds-to-words-blending-plan', name: 'From Sounds to Words' },
    gues: { check: 'why-does-my-child-guess-words-when-reading', ask: 'Why does my child guess words when reading?', plan: 'look-at-every-letter-10-day-plan', name: 'Look at Every Letter' },
    tbfd: { check: 'why-does-my-child-mix-up-b-and-d', ask: 'Why does my child mix up b and d?', plan: 'tell-b-from-d-10-day-plan', name: 'Tell b from d' },
    sght: { check: 'why-cant-my-child-remember-sight-words', ask: 'Why can’t my child remember sight words?', plan: 'words-that-stick-sight-words-10-day-plan', name: 'Words That Stick' },
    flue: { check: 'why-does-my-child-read-so-slowly', ask: 'Why does my child read so slowly?', plan: 'smooth-reading-10-day-plan', name: 'Smooth Reading' },
    undr: { check: 'my-child-can-read-but-does-not-understand', ask: 'Why can my child read but not understand?', plan: 'read-it-see-it-10-day-plan', name: 'Read It, See It' },
    spel: { check: 'my-child-can-read-but-cant-spell', ask: 'Why can my child read but not spell?', plan: 'hear-it-write-it-10-day-spelling-plan', name: 'Hear It, Write It' },
    hand: { check: 'how-to-help-my-child-with-handwriting', ask: 'How can I help my child with handwriting?', plan: 'start-at-the-top-10-day-handwriting-plan', name: 'Start at the Top' }
  },

  /* ---------- parent path ---------- */
  /* list: the "worksheets by age" page offered at the end.  start: the free pack for a child who is just starting. */
  ages: [
    { id: 'a34', label: '3 or 4', list: 'worksheets-for-4-year-olds', start: 'letter-sounds-level-1', startWhy: 'Thirteen free pages for the first four sounds: s, a, t, p.' },
    { id: 'a5', label: '5', list: 'worksheets-for-5-year-olds', start: 'free-learn-to-read-starter-pack', startWhy: 'Free pages from every learn to read pack, so you can see which level fits.' },
    { id: 'a6', label: '6', list: 'worksheets-for-6-year-olds', start: 'free-learn-to-read-starter-pack', startWhy: 'Free pages from every learn to read pack, so you can see which level fits.' },
    { id: 'a78', label: '7 or 8', list: 'worksheets-for-7-year-olds', start: 'free-decodable-reading-sampler', startWhy: 'Nine free pages of words, sentences and stories to sound out.' }
  ],

  /* plan: one of the ten above (the answer leads to its free check first, never straight to the plan).
     main: used instead when no plan fits.   free: the free alternative.   note: an extra line for one age, by the age id. */
  problems: [
    { id: 'ltrs', label: 'Does not know the letter sounds yet', plan: 'ltrs',
      why: 'A child cannot sound out a word until the sounds come right away.',
      free: { p: 'letter-sounds-level-1', why: 'A free pack for the first four sounds: s, a, t, p.' },
      note: { a34: 'Many children of 3 or 4 are still learning the sounds. Our guide says what to expect at each age.' },
      noteLink: { a34: 'guide-when-should-a-child-know-all-letters' } },
    { id: 'fstw', label: 'Knows the sounds, but cannot join them into words', plan: 'fstw',
      why: 'Joining sounds into a word is called blending. Many early readers get stuck here.',
      free: { p: 'free-blending-game', why: 'A free listening game: you say the sounds slowly and your child says the whole word.' } },
    { id: 'gues', label: 'Guesses words', plan: 'gues',
      why: 'A guessing habit hides what a child can really read.',
      free: { p: 'free-word-chains-game', why: 'A free game: one sound changes each time, and your child reads the new word.' } },
    { id: 'tbfd', label: 'Mixes up b and d', plan: 'tbfd',
      why: 'Mixing up b and d slows reading and writing, and it has its own short plan.',
      free: { p: 'guide-my-child-mixes-up-b-and-d', why: 'A short guide on what to do at home.' },
      note: { a34: 'Mixing up b and d is common before seven.', a5: 'Mixing up b and d is common before seven.', a6: 'Mixing up b and d is common before seven.' } },
    { id: 'flue', label: 'Reads slowly, word by word', plan: 'flue',
      why: 'The words are right, but the sentence does not flow yet.',
      free: { p: 'guide-child-reads-slowly-one-sound-at-a-time', why: 'A short guide on what to do at home.' } },
    { id: 'undr', label: 'Reads, but does not understand', plan: 'undr',
      why: 'Reading the words is working. Taking in what they say is the next skill.',
      free: { p: 'decodable-reading-passages-with-questions', why: 'A free pack: 24 short passages, each with questions.' } },
    { id: 'hate', label: 'Hates reading, or gives up', main: 'my-child-is-behind-in-reading', mainLabel: 'Free finder: where do I start?', mainTag: 'Free · 2 minutes · No sign-up',
      why: 'Giving up can mean the reading is too hard in one place. Check off what you see, and the finder shows the one thing to work on first.',
      free: { p: 'free-reading-games', why: 'Short reading games in the browser. A few minutes is enough.' } },
    { id: 'start', label: 'Just starting. No problem', main: 'what-next', mainLabel: 'Find my child’s reading level', mainTag: 'Free · A few minutes · No sign-up',
      why: 'Answer a few quick questions. You get your child’s reading level and a plan for this week.',
      free: 'AGE', also: ['learning-path'] },
    { id: 'unsure', label: 'I am not sure', main: 'my-child-is-behind-in-reading', mainLabel: 'Free finder: where do I start?', mainTag: 'Free · 2 minutes · No sign-up',
      why: 'Check off what is true for your child. You will see the one thing to work on first, and what can wait.',
      free: { p: 'what-next', why: 'If nothing is hard yet, find your child’s reading level here.' } },
    { id: 'more', label: 'Something else: sight words, spelling, handwriting, rhyming', more: true }
  ],

  /* the second screen behind "Something else" */
  moreProblems: [
    { id: 'sght', label: 'Cannot remember common words like the, said and was', plan: 'sght',
      why: 'A handful of words turn up in every sentence, and part of each one does not follow the usual sounds.',
      free: { p: 'guide-what-is-a-sight-word', why: 'A short guide on what these words are and how to teach one.' } },
    { id: 'spel', label: 'Can read simple words, but cannot spell them', plan: 'spel',
      why: 'Spelling is reading backwards, and it usually comes later than reading.',
      free: { p: 'free-word-building-game', why: 'A free game: hear a word and build it, one sound at a time.' } },
    { id: 'hand', label: 'Letters are messy, or start in the wrong place', plan: 'hand',
      why: 'Handwriting can be worked on beside reading. It does not have to wait.',
      free: { p: 'alphabet-tracing-worksheets', why: 'A free pack: A to Z tracing pages.' } },
    { id: 'ears', label: 'Cannot rhyme, or cannot tell me the first sound of a word', plan: 'ears',
      why: 'Hearing the sounds inside a word comes before any letters.',
      free: { p: 'free-blending-game', why: 'A free listening game with no letters to look at.' } }
  ],

  /* ---------- teacher path ---------- */
  grades: [
    { id: 'prek', label: 'PreK' },
    { id: 'k', label: 'Kindergarten' },
    { id: 'g1', label: '1st grade' },
    { id: 'g2', label: '2nd grade' }
  ],
  /* shown on every 2nd grade answer */
  gradeNote: { g2: 'Our printed packs stop at first grade. Many of the makers take your own words, so they still fit a 2nd grade group.' },

  /* the paid bundles: [name, how many packs, pages, price] (from the bundle pages) */
  bundles: {
    'letter-sounds-level-bundle': ['Letter Sounds Level Bundle', 7, 91, '$3'],
    'short-vowel-words-bundle': ['Short Vowel Words Bundle', 5, 65, '$3'],
    'read-and-match-level-bundle': ['Read and Match Level Bundle', 5, 65, '$3'],
    'color-by-word-level-bundle': ['Color By Word Level Bundle', 6, 84, '$3'],
    'cvc-word-search-level-bundle': ['CVC Word Search Level Bundle', 4, 56, '$3'],
    'dab-and-blend-level-bundle': ['Dab and Blend Level Bundle', 4, 52, '$3'],
    'learn-to-read-complete-bundle': ['Complete Learn to Read Bundle', 18, 236, '$3'],
    'complete-kindergarten-bundle': ['Complete Kindergarten Bundle', 26, 426, '$3'],
    'complete-first-grade-bundle': ['Complete First Grade Bundle', 21, 328, '$3']
  },
  bundleLine: 'All {n} packs in one file, in order, with a start-here page, a progress chart and a certificate. {pages} pages. {price} once. Print it for your own class as often as you like.',

  /* for each need and each grade: three pages (picks), the reason line (why), and the bundle (paid) when one fits. No paid line means none fits. */
  needs: [
    { id: 'centers', label: 'Centers and games', by: {
      prek: { picks: ['cover-up-letter-mat-maker', 'clip-card-maker', 'playdough-mat-maker'], why: 'Three hands-on letter and first-sound activities for a center table.' },
      k: { picks: ['roll-and-read-worksheet-generator', 'bingo-card-generator', 'clip-card-maker'], why: 'Three center games for sounding out and reading short words.', paid: 'dab-and-blend-level-bundle' },
      g1: { picks: ['sight-word-board-game-maker', 'four-in-a-row-word-game-maker', 'i-have-who-has-game-maker'], why: 'Three word games for partners or a small group.', paid: 'cvc-word-search-level-bundle' },
      g2: { picks: ['bump-game-maker', 'zap-word-game-maker', 'i-have-who-has-game-maker'], why: 'Three word games for partners or a small group.' } } },
    { id: 'phonics', label: 'Small-group phonics', by: {
      prek: { picks: ['phonemic-awareness-card-maker', 'beginning-sound-mat-maker', 'letter-sound-puzzle-maker'], why: 'Hearing first sounds and matching them to letters comes before sounding out words.', paid: 'letter-sounds-level-bundle' },
      k: { picks: ['sound-box-mat-maker', 'blending-slide-mat-maker', 'cvc-word-generator'], why: 'Mats and word lists for tapping out the sounds and sliding them into a word.', paid: 'short-vowel-words-bundle' },
      g1: { picks: ['word-mapping-mat-maker', 'digraph-worksheet-generator', 'consonant-blends-worksheet-generator'], why: 'For groups moving on from short vowel words to sh, ch, th and blends.', paid: 'short-vowel-words-bundle' },
      g2: { picks: ['long-vowel-worksheet-generator', 'digraph-worksheet-generator', 'word-sort-generator'], why: 'Silent e, digraphs, and sorting words by their pattern.' } } },
    { id: 'sight', label: 'Sight words', by: {
      prek: { picks: ['color-word-card-maker', 'sight-word-playdough-mat-maker', 'sight-word-worksheet-generator'], why: 'A gentle start: a few common words to see, build and trace.' },
      k: { picks: ['sight-word-worksheet-generator', 'heart-word-worksheet-generator', 'bingo-card-generator'], why: 'Practice pages, heart words and a bingo game, all from your own word list.', paid: 'complete-kindergarten-bundle', paidNote: 'It holds Sight Words Set 1 and Set 2 along with every other kindergarten pack.' },
      g1: { picks: ['heart-word-worksheet-generator', 'sight-word-board-game-maker', 'sight-word-checklist-maker'], why: 'Teach the tricky part, play with the words, then check which ones each child knows.', paid: 'complete-first-grade-bundle', paidNote: 'It holds Sight Words Set 1 and Set 2 along with every other first grade pack.' },
      g2: { picks: ['heart-word-worksheet-generator', 'roll-and-write-worksheet-maker', 'sight-word-checklist-maker'], why: 'Teach the tricky part, practice, then check which words each child knows.' } } },
    { id: 'writing', label: 'Handwriting and names', by: {
      prek: { picks: ['name-tracing-worksheet-generator', 'pre-writing-worksheet-generator', 'alphabet-tracing-worksheets'], why: 'Names first, then lines and curves, then letters.' },
      k: { picks: ['name-tracing-worksheet-generator', 'handwriting-worksheet-maker', 'letter-formation-chart-maker'], why: 'A name page for each child, practice pages, and a chart that shows where each letter starts.' },
      g1: { picks: ['handwriting-worksheet-maker', 'sentence-writing-paper-generator', 'lined-paper-generator'], why: 'Practice pages with your own words, and lined paper for sentences.' },
      g2: { picks: ['handwriting-worksheet-maker', 'sentence-writing-paper-generator', 'journal-page-maker'], why: 'Practice pages with your own words, and paper for sentences and journals.' } } },
    { id: 'assess', label: 'Assessment and tracking', by: {
      prek: { picks: ['letter-sound-checklist-maker', 'reward-chart-maker', 'reading-certificate-maker'], why: 'A one-page record of the sounds each child knows, and something to mark progress.' },
      k: { picks: ['letter-sound-checklist-maker', 'sight-word-checklist-maker', 'reading-log-maker'], why: 'One-page records for letter sounds and sight words, and a reading log to send home.' },
      g1: { picks: ['sight-word-checklist-maker', 'fluency-passage-generator', 'reading-log-maker'], why: 'A word checklist, passages with word counts for a quick fluency check, and a reading log.' },
      g2: { picks: ['sight-word-checklist-maker', 'fluency-passage-generator', 'reading-log-maker'], why: 'A word checklist, passages with word counts for a quick fluency check, and a reading log.' } } },
    { id: 'passages', label: 'Reading passages and fluency', by: {
      prek: { picks: ['alphabet-mini-book-maker', 'mini-book-maker', 'read-the-room-maker'], why: 'Before passages come little books and words around the room.' },
      k: { picks: ['decodable-sentence-generator', 'decodable-book-maker', 'sound-it-out-decodable-phonics-practice'], why: 'Sentences and little books a beginner can sound out, and a free 27-page practice pack.', paid: 'read-and-match-level-bundle' },
      g1: { picks: ['reading-passage-generator', 'fluency-passage-generator', 'decodable-reading-passages-with-questions'], why: 'Passages with questions, passages with word counts, and a free pack of 24 short passages.', paid: 'learn-to-read-complete-bundle' },
      g2: { picks: ['reading-passage-generator', 'fluency-passage-generator', 'story-map-maker'], why: 'Passages with questions, passages with word counts, and a story map for retelling.' } } },
    { id: 'charts', label: 'Classroom charts and posters', by: {
      prek: { picks: ['alphabet-chart-maker', 'alphabet-poster-maker', 'letter-formation-chart-maker'], why: 'An ABC chart, wall cards, and a chart that shows where each letter starts.' },
      k: { picks: ['alphabet-poster-maker', 'word-wall-card-maker', 'word-family-chart-maker'], why: 'Wall cards for the alphabet, a word wall, and a word family chart.' },
      g1: { picks: ['phonics-sound-chart-maker', 'vowel-chart-maker', 'word-wall-card-maker'], why: 'Charts for blends, digraphs and vowels, and cards for the word wall.' },
      g2: { picks: ['phonics-sound-chart-maker', 'reading-strategy-poster-maker', 'phonics-poster-maker'], why: 'A sound chart, a decoding poster, and anchor charts for the pattern of the week.' } } },
    { id: 'finishers', label: 'Something for early finishers', by: {
      prek: { picks: ['alphabet-coloring-page-maker', 'alphabet-maze-maker', 'i-spy-worksheet-generator'], why: 'Quiet pages a young child can start alone: color, follow the letters, count and find.' },
      k: { picks: ['color-by-sight-word-generator', 'word-search-maker-for-kids', 'dot-marker-letter-maker'], why: 'Quiet pages that still practice words and letters.', paid: 'color-by-word-level-bundle' },
      g1: { picks: ['word-search-maker-for-kids', 'picture-crossword-maker', 'word-ladder-generator'], why: 'Word puzzles for children who can already read short words.', paid: 'cvc-word-search-level-bundle' },
      g2: { picks: ['picture-crossword-maker', 'word-ladder-generator', 'sentence-scramble-generator'], why: 'Word and sentence puzzles for children who finish early.' } } },
    { id: 'year', label: 'A full set for the year', by: {
      prek: { picks: ['preschool-worksheets', 'alphabet-tracing-worksheets', 'letter-of-the-week-worksheet-maker'], why: 'Every preschool pack in one list, a free A to Z tracing pack, and a letter of the week set.', paid: 'letter-sounds-level-bundle' },
      k: { picks: ['kindergarten-worksheets', 'free-learn-to-read-starter-pack', 'morning-work-generator'], why: 'Every kindergarten pack in one list, free pages from each pack to try, and daily morning work.', paid: 'complete-kindergarten-bundle' },
      g1: { picks: ['first-grade-worksheets', 'free-learn-to-read-starter-pack', 'learning-path'], why: 'Every first grade pack in one list, free pages from each pack to try, and the order to teach them in.', paid: 'complete-first-grade-bundle' },
      g2: { picks: ['first-grade-worksheets', 'reading-passage-generator', 'spelling-list-maker'], why: 'The first grade packs for review, plus passages and spelling lists you make at your own level.' } } }
  ],

  /* ---------- printable path: the five makers shown under the search box ---------- */
  top: ['cvc-word-generator', 'name-tracing-worksheet-generator', 'sight-word-worksheet-generator', 'bingo-card-generator', 'worksheet-generator'],

  /* ---------- every page of the site, for the search box and for the names of links ----------
     One line per kind. Pages are split by ";". A page is "address" or "address:Name".
     With no name, the name is the address in plain words (cvc-word-generator = CVC word generator).
     packs: each one also has a "free-" page of sample pages, added by the code, unless its address ends with "!". */
  pages: {
    /*PAGES-START*/
    makers: 'name-tracing-worksheet-generator;handwriting-worksheet-maker;tracing-worksheet-generator;word-tracing-worksheet-generator;number-tracing-generator;lined-paper-generator;worksheet-generator:Worksheet generator: build your own;cvc-word-generator;sight-word-worksheet-generator;beginning-sounds-worksheet-generator;decodable-sentence-generator;sentence-scramble-generator;matching-worksheet-maker;spelling-worksheet-generator;word-search-maker-for-kids;flashcard-maker-printable:Flashcard maker;bingo-card-generator;number-line-generator;ten-frame-generator;addition-worksheet-generator:Addition and subtraction worksheet generator;reward-chart-maker;roll-and-read-worksheet-generator;word-sort-generator;number-bonds-worksheet-generator;decodable-text-generator:Decodable text generator: story sheets;reading-passage-generator:Reading passage generator with questions;fluency-passage-generator;mini-book-maker:Mini book maker: fold-up books;word-ladder-generator;heart-word-worksheet-generator;color-by-sight-word-generator;dot-marker-letter-maker:Dot marker letter and word maker;sight-word-board-game-maker;name-and-word-mat-maker;playdough-mat-maker:Playdough letter mat maker;clip-card-maker;letter-sound-puzzle-maker;word-building-mat-maker;find-the-letter-worksheet-generator;journal-page-maker;sentence-writing-paper-generator;scissor-skills-worksheet-generator;pre-writing-worksheet-generator:Pre-writing worksheet generator;morning-work-generator;letter-sound-checklist-maker;sight-word-checklist-maker;reading-log-maker;bookmark-maker;phonics-flashcard-maker;alphabet-chart-maker;task-card-maker;i-spy-worksheet-generator:I Spy worksheet generator;word-family-flip-book-maker;write-the-room-maker;read-the-room-maker;sentence-building-cards-maker;phonics-poster-maker;letter-crown-maker;interactive-notebook-page-maker;phonemic-awareness-card-maker;letter-scavenger-hunt-maker;make-the-letter-task-card-maker;zap-word-game-maker:Zap! word game maker;story-map-maker;beginning-sound-mat-maker;bubble-letter-template-maker;alphabet-matching-worksheet-maker;picture-sort-maker;calendar-page-maker;spelling-list-maker;picture-crossword-maker;name-tag-maker;reading-certificate-maker;go-fish-word-card-maker:Go Fish word card maker;memory-match-game-maker;old-maid-word-card-maker:Old Maid word card maker;i-have-who-has-game-maker:I have, who has game maker;word-dominoes-maker;word-family-spoons-card-game;tumbling-tower-word-labels;cup-stacking-word-labels;alphabet-mini-book-maker;decodable-book-maker;foldable-word-book-maker;word-slider-maker;word-wheel-maker;lift-the-flap-page-maker;class-book-page-maker;lapbook-template-maker;color-path-game-word-cards;color-match-word-card-game;swat-the-word-game-maker;word-fishing-game-maker;category-sorting-mat-maker;roll-and-write-worksheet-maker;race-to-the-top-letter-game;roll-and-cover-game-maker;bump-game-maker;spin-and-read-game-maker;four-in-a-row-word-game-maker;connect-the-path-word-game;tic-tac-toe-word-game-maker:Tic-tac-toe word game maker;cover-up-letter-mat-maker:Cover-up letter mat maker;sound-box-mat-maker;word-mapping-mat-maker;blending-slide-mat-maker;drive-and-blend-mat-maker;sight-word-playdough-mat-maker;alphabet-poster-maker;phonics-sound-chart-maker;vowel-chart-maker;word-family-chart-maker;word-wall-card-maker;picture-word-bank-maker;color-word-card-maker;sight-word-list-poster-maker;personal-word-wall-maker;mini-office-maker;desk-helper-strip-maker;letter-formation-chart-maker;reading-strategy-poster-maker;weekly-focus-board-maker;learning-placemat-maker;digraph-worksheet-generator;consonant-blends-worksheet-generator;long-vowel-worksheet-generator;vowel-worksheet-generator;missing-letter-worksheet-generator;alphabet-maze-maker;letter-of-the-week-worksheet-maker;alphabet-tracing-card-maker;number-word-tracing-worksheet-generator;alphabet-coloring-page-maker;free-worksheet-maker',
    packs: 'free-decodable-reading-sampler!:Free Decodable Reading Sampler;sound-it-out-decodable-phonics-practice!:Sound It Out;decodable-reading-passages-with-questions!:Read It, Get It;alphabet-tracing-worksheets:Alphabet Tracing;number-tracing-and-counting-1-to-20:Numbers 1 to 20;addition-within-10-worksheets:Addition to 10;subtraction-within-10-worksheets:Subtraction to 10;addition-to-5;subtraction-to-5;addition-to-20;sight-words-set-1:Sight Words Set 1;sight-words-set-2:Sight Words Set 2;short-vowel-a-words:Short A Words;cvc-cut-and-paste:CVC Cut and Paste;short-vowel-e-words:Short E Words;short-vowel-i-words:Short I Words;short-vowel-o-words:Short O Words;letter-sounds-level-1:Letter Sounds Level 1;letter-sounds-level-3:Letter Sounds Level 3;letter-sounds-level-5:Letter Sounds Level 5;letter-sounds-level-6:Letter Sounds Level 6;short-vowel-u-words:Short U Words;letter-sounds-level-2:Letter Sounds Level 2;letter-sounds-level-4:Letter Sounds Level 4;letter-sounds-level-7:Letter Sounds Level 7;free-addition-and-subtraction-starter-pack!:Free Addition and Subtraction Starter Pack;read-and-match-level-4:Read and Match Level 4;read-and-match-level-6:Read and Match Level 6;read-and-match-level-7:Read and Match Level 7;read-and-match-level-3:Read and Match Level 3;read-and-match-level-5:Read and Match Level 5;color-by-word-level-2:Color by Word Level 2;color-by-word-level-3:Color by Word Level 3;color-by-word-level-4:Color by Word Level 4;color-by-word-level-6:Color by Word Level 6;color-by-word-level-7:Color by Word Level 7;cvc-word-cards-set-2:CVC Word Cards Set 2;cvc-word-cards-set-1:CVC Word Cards Set 1;color-by-word-level-5:Color by Word Level 5;cvc-word-search-level-4:CVC Word Search Level 4;cvc-word-search-level-5:CVC Word Search Level 5;cvc-word-search-level-6:CVC Word Search Level 6;cvc-word-search-level-7:CVC Word Search Level 7;dab-and-blend-level-3:Dab and Blend Level 3;dab-and-blend-level-4:Dab and Blend Level 4;dab-and-blend-level-5:Dab and Blend Level 5;dab-and-blend-level-6:Dab and Blend Level 6;free-learn-to-read-starter-pack!:Free Learn to Read Starter Pack;free-games-charts-and-activities-starter-pack!:Free Games, Charts and Activities Starter Pack',
    bundles: 'read-and-match-level-bundle:Read and Match Level Bundle;letter-sounds-level-bundle:Letter Sounds Level Bundle;short-vowel-words-bundle:Short Vowel Words Bundle;learn-to-read-complete-bundle:Complete Learn to Read Bundle;complete-kindergarten-bundle:Complete Kindergarten Bundle;color-by-word-level-bundle:Color By Word Level Bundle;complete-first-grade-bundle:Complete First Grade Bundle;cvc-word-search-level-bundle:CVC Word Search Level Bundle;dab-and-blend-level-bundle:Dab and Blend Level Bundle',
    games: 'free-reading-games:Free Reading Games;free-blending-game:Free Blending Game;free-word-building-game:Free Word Building Game;free-cvc-word-reading-game:Free CVC Word Reading Game;free-word-chains-game:Free Word Chains Game;free-sentence-reading-game:Free Sentence Reading Game;free-decodable-story-game:Free Decodable Story Game;app:Free reading app',
    guides: 'guides;guide-my-child-cannot-remember-sight-words:My Child Cannot Remember Sight Words: What to Do;guide-how-to-teach-pencil-grip:How to Teach a Child to Hold a Pencil;guide-my-child-guesses-words-instead-of-sounding-them-out:My Child Guesses Words Instead of Sounding Out;guide-how-to-teach-a-child-to-tell-time:How to Teach a Child to Tell Time;guide-my-child-does-not-understand-subtraction:My Child Does Not Understand Subtraction: What to Do;guide-child-reads-slowly-one-sound-at-a-time:My Child Reads Slowly, One Sound at a Time: What to Do;guide-what-is-a-sight-word:What Is a Sight Word?;guide-when-should-a-child-know-all-letters:When Should a Child Know All Their Letters?;guide-my-child-knows-sounds-but-cannot-blend:My Child Knows Sounds but Cannot Blend: What to Do;guide-my-child-mixes-up-b-and-d:My Child Mixes Up B and D: What to Do;guide-cutting-and-gluing-skills-by-age:What Age Can a Child Cut Shapes and Glue Accurately;guide-when-do-kids-count-to-100:When Should a Child Learn to Count to 100?',
    research: 'research-what-works-in-teaching-reading:What works in teaching reading?;research-does-phonics-work:Does phonics work?;research-hearing-the-sounds-in-words:Hearing the sounds in words;research-mixing-up-b-and-d:Mixing up b and d;research-blending-sounds-into-words:Blending sounds into words;research-letter-names-or-letter-sounds:Letter names or letter sounds?;research-sight-words-memorize-or-sound-out:Sight words: memorize or sound out?;research-guessing-words-from-pictures:Guessing words from pictures;research-slow-reading-and-fluency:Slow, word-by-word reading;research-reading-comprehension:Reads the words but does not understand;research-teaching-spelling:Can read but cannot spell;research-handwriting-practice:Handwriting practice;research-reading-aloud-to-children:Reading aloud to your child;research-vocabulary-and-talking:Talking, vocabulary and reading;research-decodable-books:Decodable books for beginners;research-do-children-learn-to-read-naturally:Do children learn to read naturally?;research-dyslexia-early-signs:Dyslexia: early signs and what helps;research-how-often-to-practice-reading:How often to practice reading;research-does-rhyming-matter:Does rhyming matter for reading?;research-reading-longer-words:Reading longer words;research-older-child-still-a-beginner:An older child still learning to read;research-reading-tutoring:Does reading tutoring help?;research-sound-games-with-letters:Sound games: with letters or without?;research-what-parents-can-do-at-home:What parents can do at home;research-reading-apps:Do reading apps help?;research-english-as-a-second-language:Learning to read in a second language;research-when-to-worry-about-reading:When to worry about reading;research-being-read-to-and-later-reading:Does being read to predict reading?;research-early-predictors-of-reading:Early predictors of reading;research-remembering-letter-sounds:Forgetting letter sounds;reading-research:The Reading Lab',
    lists: 'learn-to-read-printables:Learn to Read;sight-words-worksheets:Sight Words;alphabet-and-handwriting-worksheets:Alphabet and Handwriting;numbers-and-counting-worksheets:Numbers and Counting;addition-and-subtraction-worksheets:Addition and Subtraction;games-charts-and-activities:Games, Charts and Activities;worksheets-for-3-year-olds:Worksheets for 3 Year Olds;worksheets-for-4-year-olds:Worksheets for 4 Year Olds;worksheets-for-5-year-olds:Worksheets for 5 Year Olds;worksheets-for-6-year-olds:Worksheets for 6 Year Olds;worksheets-for-7-year-olds:Worksheets for 7 Year Olds;preschool-worksheets:Preschool Worksheets;kindergarten-worksheets:Kindergarten Worksheets;first-grade-worksheets:First Grade Worksheets;preschool-learn-to-read-worksheets:Preschool Learn to Read Worksheets;preschool-addition-and-subtraction-worksheets:Preschool Addition and Subtraction Worksheets;kindergarten-learn-to-read-worksheets:Kindergarten Learn to Read Worksheets;kindergarten-sight-words-worksheets:Kindergarten Sight Words Worksheets;kindergarten-addition-and-subtraction-worksheets:Kindergarten Addition and Subtraction Worksheets;kindergarten-games-charts-and-activities-worksheets:Kindergarten Games, Charts and Activities Worksheets;first-grade-learn-to-read-worksheets:First Grade Learn to Read Worksheets;first-grade-sight-words-worksheets:First Grade Sight Words Worksheets;first-grade-addition-and-subtraction-worksheets:First Grade Addition and Subtraction Worksheets;first-grade-games-charts-and-activities-worksheets:First Grade Games, Charts and Activities Worksheets;addition-worksheets:Addition Worksheets;subtraction-worksheets:Subtraction Worksheets;short-vowel-words-worksheets:Short Vowel Words Worksheets;letter-sounds-level-worksheets:Letter Sounds Level Worksheets;read-and-match-level-worksheets:Read and Match Level Worksheets;color-by-word-level-worksheets:Color By Word Level Worksheets;cvc-word-cards-worksheets:CVC Word Cards Worksheets;cvc-word-search-level-worksheets:CVC Word Search Level Worksheets;dab-and-blend-level-worksheets:Dab and Blend Level Worksheets;skills:Skills We Cover;what-next:Find my child’s reading level;learning-path:The Learning Path;my-child-is-behind-in-reading:My child is behind in reading: where do I start?;printables:All Printables;free-printable-worksheets:Free Worksheets;how-we-make-worksheets:How We Make Our Worksheets',
    other: 'about:About Sound It Out;how-it-works:How It Works;terms-of-use:Terms of Use;privacy;glossary;help;contact'
    /*PAGES-END*/
  }
};

/* =====================================================  LOGIC  ===================================================== */
(function (D) {
  'use strict';
  var T = D.text;

  /* ---- names and kinds of pages, built once from DATA.pages ---- */
  var INDEX = [], BY = {};
  function plain(slug) {
    var s = slug.replace(/-/g, ' ').replace(/\bcvc\b/g, 'CVC').replace(/\babc\b/g, 'ABC').replace(/\bi\b/g, 'I');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function add(slug, name, kind) { if (BY[slug]) return; var o = { p: slug, n: name || plain(slug), k: kind }; BY[slug] = o; INDEX.push(o); }
  (function build() {
    var kinds = { makers: 'Free maker', packs: 'Free pack', bundles: 'Bundle', games: 'Free game', guides: 'Guide', research: 'Research', lists: 'List of printables', other: '' };
    var k, i, parts, e, c, slug, name, twin, id, b;
    for (id in D.plans) if (D.plans.hasOwnProperty(id)) {
      add(D.plans[id].check, 'Free check: ' + D.plans[id].ask, 'Free check');
      add(D.plans[id].plan, D.plans[id].name + ': 10-day plan', '10-day plan · $19');
    }
    for (k in D.pages) if (D.pages.hasOwnProperty(k)) {
      parts = D.pages[k].split(';');
      for (i = 0; i < parts.length; i++) {
        e = parts[i]; if (!e) continue;
        c = e.indexOf(':'); slug = c < 0 ? e : e.slice(0, c); name = c < 0 ? '' : e.slice(c + 1);
        twin = k === 'packs'; if (slug.charAt(slug.length - 1) === '!') { slug = slug.slice(0, -1); twin = false; }
        b = D.bundles[slug];
        add(slug, name, k === 'bundles' && b ? 'Bundle · ' + b[3] : kinds[k]);
        if (twin) add('free-' + slug, 'Free ' + (name || plain(slug)) + ' Worksheets', 'Free sample pages');
      }
    }
  })();
  function nameOf(slug) { return BY[slug] ? BY[slug].n : plain(slug); }
  function kindOf(slug) { return BY[slug] ? BY[slug].k : ''; }

  /* ---- the tree as a pure function: answers in, one result out (test.mjs walks this too) ---- */
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function resolve(s) {
    var r = { main: null, next: null, free: null, picks: [], paid: null, also: [], notes: [], end: [D.everything.printables, D.everything.makers] }, a, q, pl, g, n, cell, b;
    if (s.who === 'parent') {
      a = find(D.ages, s.age); q = find(D.problems, s.prob); if (q && q.more) q = find(D.moreProblems, s.more);
      if (!a || !q) return null;
      if (q.plan) {
        pl = D.plans[q.plan];
        r.main = { p: pl.check, label: 'Free check: ' + pl.ask, tag: T.checkTag, why: q.why + ' ' + T.checkEnd };
        r.next = { p: pl.plan, label: pl.name };
      } else r.main = { p: q.main, label: q.mainLabel, tag: q.mainTag, why: q.why };
      r.free = q.free === 'AGE' ? { p: a.start, why: a.startWhy } : { p: q.free.p, why: q.free.why };
      if (q.note && q.note[a.id]) r.notes.push({ t: q.note[a.id], p: q.noteLink && q.noteLink[a.id] });
      r.also = (q.also || []).concat([a.list]);
      return r;
    }
    if (s.who === 'teacher') {
      g = find(D.grades, s.grade); n = find(D.needs, s.need); if (!g || !n) return null;
      cell = n.by[g.id]; if (!cell) return null;
      r.picks = cell.picks.slice(); r.why = cell.why;
      if (cell.paid) { b = D.bundles[cell.paid]; r.paid = { p: cell.paid, label: b[0] + ' · ' + b[3], why: (cell.paidNote ? cell.paidNote + ' ' : '') + D.bundleLine.replace('{n}', b[1]).replace('{pages}', b[2]).replace('{price}', b[3]) }; }
      if (D.gradeNote[g.id]) r.notes.push({ t: D.gradeNote[g.id] });
      return r;
    }
    if (s.who === 'print') { r.picks = D.top.slice(); r.search = true; return r; }
    return null;
  }
  function search(q) {
    var terms = q.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/^\s+|\s+$/g, '').split(/\s+/), out = [], i, j, h, ok, sc;
    if (!terms[0]) return out;
    for (i = 0; i < INDEX.length; i++) {
      h = (INDEX[i].n + ' ' + INDEX[i].p.replace(/-/g, ' ') + ' ' + INDEX[i].k).toLowerCase(); ok = true; sc = 0;
      for (j = 0; j < terms.length; j++) { if (h.indexOf(terms[j]) < 0) { ok = false; break; } if (INDEX[i].n.toLowerCase().indexOf(terms[j]) === 0) sc -= 2; }
      if (ok) out.push({ o: INDEX[i], s: sc + (/maker/i.test(INDEX[i].k) ? -1 : 0) + (/sample|Research/.test(INDEX[i].k) ? 1 : 0), i: i });
    }
    out.sort(function (x, y) { return x.s - y.s || x.i - y.i; });
    for (i = 0; i < out.length; i++) out[i] = out[i].o;
    return out;
  }
  D.api = { resolve: resolve, search: search, nameOf: nameOf, kindOf: kindOf, index: INDEX };
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (window.SIOH_LOADED) return; window.SIOH_LOADED = 1;

  /* ---- where the site lives: the folder this script was loaded from (or data-base on the script tag) ---- */
  var BASE = (function () {
    var s = document.currentScript, all, i, a;
    if (!s) { all = document.getElementsByTagName('script'); for (i = all.length - 1; i >= 0; i--) if (/helper(\.min)?\.js(\?|#|$)/.test(all[i].src || '')) { s = all[i]; break; } }
    a = document.createElement('a');
    a.href = (s && s.getAttribute('data-base')) || (s && s.src ? s.src.replace(/[?#].*$/, '').replace(/[^\/]*$/, '') : '/');
    return a.href.replace(/\/?$/, '/');
  })();
  function url(slug) { return BASE + slug + '/'; }
  var HERE = (function () { var a = document.createElement('a'); a.href = BASE; var root = a.pathname, p = location.pathname.replace(/index\.html$/, ''); return p.indexOf(root) === 0 ? p.slice(root.length) : p.replace(/^\//, ''); })();
  if (D.hideOn && D.hideOn.test(HERE)) return;

  /* ---- a small memory for this visit only (stays in the browser; works without it) ---- */
  var mem = {};
  function load() { try { mem = JSON.parse(window.sessionStorage.getItem('sioh') || '{}') || {}; } catch (e) { mem = {}; } }
  function save() { try { window.sessionStorage.setItem('sioh', JSON.stringify(mem)); } catch (e) {} }
  load(); if (mem.hide) return;

  var CSS = '.sioh,.sioh *{box-sizing:border-box}' +
    '.sioh{font-family:"Trebuchet MS","Segoe UI",system-ui,Arial,sans-serif;font-size:16px;line-height:1.45;color:#1f2a44;text-align:left}' +
    '.sioh button{font:inherit;color:inherit;cursor:pointer;margin:0}' +
    '.sioh-btn{position:fixed;right:16px;bottom:16px;z-index:60;display:flex;align-items:center;gap:0;background:none;border:0;padding:0;font-weight:800!important;font-size:17px!important}' +
    '.sioh-lbl{order:1;position:relative;margin-right:12px;background:#fff;border:4px solid #1f2a44;border-radius:22px;padding:9px 16px;box-shadow:0 5px 0 #e0527a;font-family:"Comic Sans MS","Chalkboard SE","Trebuchet MS",sans-serif;white-space:nowrap;transform-origin:100% 60%}' +
    '.sioh-lbl:after{content:"";position:absolute;right:-13px;top:50%;margin-top:-9px;border:9px solid transparent;border-left:11px solid #1f2a44;border-right:0}' +
    '.sioh-lbl:before{content:"";position:absolute;right:-7px;top:50%;margin-top:-6px;border:6px solid transparent;border-left:8px solid #fff;border-right:0;z-index:1}' +
    '.sioh-q{order:2}.sioh-btn:hover .sioh-lbl{background:#fff3c9}.sioh-btn:hover .sioh-q{transform:scale(1.08) rotate(-4deg)}.sioh-btn:active .sioh-q{transform:scale(.96)}' +
    '.sioh-q{position:relative;flex:none;width:82px;height:82px;border-radius:50%;padding:5px;background:conic-gradient(#e0527a,#ffd84d,#2f9e63,#2f80d0,#8a5fd1,#e0527a);border:4px solid #1f2a44;box-shadow:0 6px 0 #1f2a44;transition:transform .15s}' +
    '.sioh-q img{display:block;width:100%;height:100%;border-radius:50%;background:#fff;object-fit:contain}' +
    '.sioh-q b{position:absolute;right:-6px;top:-6px;width:30px;height:30px;border-radius:50%;background:#e0527a;color:#fff;border:3px solid #1f2a44;font:800 18px/24px "Comic Sans MS","Trebuchet MS",sans-serif;text-align:center}' +
    '.sioh-btn[aria-expanded=true]{display:none}' +
    '.sioh :focus-visible{outline:4px solid #2b6fd6;outline-offset:2px}' +
    '.sioh-panel{position:fixed;right:16px;bottom:16px;z-index:70;width:390px;max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);max-height:min(660px,calc(100dvh - 32px));display:flex;flex-direction:column;background:#fffaf0;border:5px solid #1f2a44;border-radius:26px;box-shadow:0 8px 0 #e0527a,0 18px 40px rgba(31,42,68,.3);overflow:hidden}' +
    '.sioh-panel[hidden]{display:none}' +
    '.sioh-head{flex:none;display:flex;align-items:center;gap:8px;background:#1f2a44;color:#fff;padding:10px 10px 10px 16px}' +
    '.sioh-head h2{flex:1;margin:0;font:800 19px "Comic Sans MS","Chalkboard SE","Trebuchet MS",sans-serif;color:#fff;text-align:left}' +
    '.sioh-x{flex:none;width:40px;height:40px;border-radius:50%;background:#fff;color:#1f2a44!important;border:0;font-size:24px!important;font-weight:800!important;line-height:1}' +
    '.sioh-body{flex:1;overflow:auto;padding:14px 14px 16px;-webkit-overflow-scrolling:touch}' +
    '.sioh-body p{margin:0 0 8px}' +
    '.sioh-trail{font-size:14px;color:#55617a;margin:0 0 10px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;list-style:none;padding:0}' +
    '.sioh-trail li{background:#fff;border:2px solid #1f2a44;border-radius:999px;padding:2px 10px;color:#1f2a44;font-weight:700}.sioh-trail li:first-child{background:none;border:0;padding:0;font-weight:400;color:#55617a}' +
    '.sioh-ask{background:#fff;border:3px solid #1f2a44;border-radius:18px 18px 18px 4px;padding:10px 14px;margin:0 0 12px;font:800 19px "Comic Sans MS","Chalkboard SE","Trebuchet MS",sans-serif;line-height:1.25}' +
    '.sioh-ask small{display:block;font:400 15px "Trebuchet MS","Segoe UI",system-ui,Arial,sans-serif;color:#55617a;margin-top:4px}' +
    '.sioh-ask:focus{outline:none}' +
    '.sioh-opts{display:grid;gap:9px;margin:0;padding:0;list-style:none}' +
    '.sioh-opt{display:block;width:100%;text-align:left;background:#fff;border:3px solid #1f2a44;border-radius:16px;padding:10px 14px;font-weight:700!important;font-size:16px!important;box-shadow:0 4px 0 #1f2a44}' +
    '.sioh-opt:hover{background:#fff3c9}.sioh-opt:active{transform:translateY(2px);box-shadow:0 2px 0 #1f2a44}' +
    '.sioh-two{grid-template-columns:1fr 1fr}' +
    '.sioh-card{border:4px solid #1f2a44;border-radius:20px;padding:12px 14px;margin:0 0 12px;background:#fff}' +
    '.sioh-main{background:linear-gradient(135deg,#fff3c9,#ffe3ee)}' +
    '.sioh-k{display:block;font-weight:800;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#b3264f;margin-bottom:6px}' +
    '.sioh a{color:#1f2a44;font-weight:800;text-decoration:underline}' +
    '.sioh a.sioh-go{display:block;text-decoration:none;text-align:center;color:#fff;background:#e0527a;border:4px solid #1f2a44;border-radius:999px;padding:10px 16px;margin:0 0 8px;font-size:17px;line-height:1.25;box-shadow:0 5px 0 #1f2a44}' +
    '.sioh a.sioh-go:hover{background:#c93f67}.sioh a.sioh-go.sioh-alt{background:#fff;color:#1f2a44}.sioh a.sioh-go.sioh-alt:hover{background:#fff3c9}' +
    '.sioh-card p:last-child{margin-bottom:0}.sioh-small{font-size:15px;color:#3b4660}' +
    '.sioh-list{margin:0;padding:0;list-style:none;display:grid;gap:8px}' +
    '.sioh-list a{display:flex;justify-content:space-between;align-items:center;gap:10px;text-decoration:none;background:#fff;border:3px solid #1f2a44;border-radius:14px;padding:8px 12px;box-shadow:0 3px 0 #1f2a44}' +
    '.sioh-list a:hover{background:#fff3c9}.sioh-list em{flex:none;font-style:normal;font-weight:700;font-size:12px;color:#55617a;text-align:right}' +
    '.sioh-in{display:block;width:100%;font:inherit;font-size:17px;color:#1f2a44;background:#fff;border:3px solid #1f2a44;border-radius:14px;padding:10px 12px;margin:0 0 6px}' +
    '.sioh-h{font:800 16px "Comic Sans MS","Chalkboard SE","Trebuchet MS",sans-serif;margin:14px 0 8px}' +
    '.sioh-fine{font-size:14px;color:#55617a;margin:10px 0 0}' +
    '.sioh-end{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;margin-top:12px;padding-top:12px;border-top:3px dashed #c9cfdd;font-size:15px}' +
    '.sioh-link{background:none;border:0;padding:4px 0;font-weight:800!important;text-decoration:underline;font-size:15px!important}' +
    '.sioh-foot{flex:none;display:flex;justify-content:space-between;gap:10px;padding:6px 14px 8px;border-top:3px solid #1f2a44;background:#fff}' +
    '.sioh-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
    '@media(max-width:600px){.sioh-btn{right:10px;bottom:10px;font-size:14px!important}.sioh-q{width:64px;height:64px;padding:4px}.sioh-q b{width:26px;height:26px;font-size:15px;line-height:20px}.sioh-lbl{padding:6px 11px;margin-right:10px;border-width:3px;border-radius:18px}.sioh-btn.sioh-quiet .sioh-lbl{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);margin:0;padding:0;border:0}' +
    '.sioh-panel{left:0;right:0;bottom:0;width:auto;max-width:none;max-height:78vh;max-height:78dvh;border-radius:24px 24px 0 0;border-width:5px 0 0;box-shadow:0 -10px 30px rgba(31,42,68,.3)}}' +
    '@media(prefers-reduced-motion:no-preference){.sioh-q{animation:sioh-bob 2.6s ease-in-out infinite}.sioh-lbl{animation:sioh-pop .5s cubic-bezier(.3,1.6,.5,1) 1.2s both,sioh-wig 7s ease-in-out 4s infinite}.sioh-q b{animation:sioh-ping 2.6s ease-in-out infinite}' +
    '@keyframes sioh-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}@keyframes sioh-pop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}' +
    '@keyframes sioh-wig{0%,88%,100%{transform:rotate(0)}91%{transform:rotate(-4deg)}94%{transform:rotate(4deg)}97%{transform:rotate(-2deg)}}@keyframes sioh-ping{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}' +
    '.sioh-btn:hover .sioh-q{animation:none}}' +
    '@media(prefers-reduced-motion:no-preference){.sioh-panel{animation:sioh-up .18s ease-out}@keyframes sioh-up{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}}' +
    '@media print{.sioh{display:none!important}}';

  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function link(slug, label, cls) {
    var here = HERE === slug + '/';
    return '<a' + (cls ? ' class="' + cls + '"' : '') + ' href="' + esc(url(slug)) + '"' + (here ? ' aria-current="page"' : '') + '>' + esc(label || nameOf(slug)) + (here ? ' (' + esc(T.here) + ')' : '') + '</a>';
  }
  function row(slug) { return '<li><a href="' + esc(url(slug)) + '"><span>' + esc(nameOf(slug)) + '</span>' + (kindOf(slug) ? '<em>' + esc(kindOf(slug)) + '</em>' : '') + '</a></li>'; }
  function rows(list) { var h = '', i; for (i = 0; i < list.length; i++) h += row(list[i]); return '<ul class="sioh-list">' + h + '</ul>'; }
  function opts(list, two) { var h = '', i; for (i = 0; i < list.length; i++) h += '<li><button type="button" class="sioh-opt" data-v="' + esc(list[i].id) + '">' + esc(list[i].label) + '</button></li>'; return '<ul class="sioh-opts' + (two ? ' sioh-two' : '') + '">' + h + '</ul>'; }

  /* ---- the screens ---- */
  var st = mem.st || { screen: 'who' }, hist = mem.hist || [];
  var root, btn, panel, body, backBtn;
  var NEXT = { who: function (v) { st.who = v; return v === 'parent' ? 'age' : v === 'teacher' ? 'grade' : 'result'; }, age: function (v) { st.age = v; return 'prob'; },
    prob: function (v) { st.prob = v; var q = find(D.problems, v); return q && q.more ? 'more' : 'result'; }, more: function (v) { st.more = v; return 'result'; },
    grade: function (v) { st.grade = v; return 'need'; }, need: function (v) { st.need = v; return 'result'; } };
  function trail() {
    var t = [], x;
    if (st.who && st.screen !== 'who') { x = find(D.who, st.who); t.push(x.label); }
    if (st.who === 'parent') { if (st.age && /prob|more|result/.test(st.screen)) t.push('Age ' + find(D.ages, st.age).label); if (st.prob && /more|result/.test(st.screen)) { x = find(D.problems, st.prob); if (!x.more) t.push(x.label); } if (st.more && st.screen === 'result' && find(D.problems, st.prob).more) t.push(find(D.moreProblems, st.more).label); }
    if (st.who === 'teacher') { if (st.grade && /need|result/.test(st.screen)) t.push(find(D.grades, st.grade).label); if (st.need && st.screen === 'result') t.push(find(D.needs, st.need).label); }
    if (!t.length) return '';
    for (x = 0; x < t.length; x++) t[x] = '<li>' + esc(t[x]) + '</li>';
    return '<ul class="sioh-trail"><li>' + esc(T.you) + ':</li>' + t.join('') + '</ul>';
  }
  function ask(q, small) { return '<p class="sioh-ask" id="sioh-ask" tabindex="-1">' + esc(q) + (small ? '<small>' + esc(small) + '</small>' : '') + '</p>'; }
  function ending() {
    return '<div class="sioh-end"><button type="button" class="sioh-link" data-act="again">' + esc(T.again) + '</button>' + link(D.everything.printables, T.allPrintables) + link(D.everything.makers, T.allMakers) + '</div>';
  }
  function result() {
    var r = resolve(st), h = '', i;
    if (!r) { st = { screen: 'who' }; hist = []; return screen(); }
    if (r.search) {
      h += ask(T.search, T.searchHint) + '<label class="sioh-sr" for="sioh-in">' + esc(T.search) + '</label><input class="sioh-in" id="sioh-in" type="search" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search">' +
        '<p class="sioh-fine" style="margin:0 0 8px">' + esc(T.searchNote) + '</p><div id="sioh-res" aria-live="polite"></div><p class="sioh-h">' + esc(T.top) + '</p>' + rows(r.picks);
      return h + ending();
    }
    if (r.main) {
      h += '<div class="sioh-card sioh-main" id="sioh-ask" tabindex="-1"><span class="sioh-k">' + esc(T.startHere + ' · ' + r.main.tag) + '</span>' + link(r.main.p, r.main.label, 'sioh-go') + '<p>' + esc(r.main.why) + '</p>' +
        (r.next ? '<p class="sioh-small">' + esc(T.nextLead) + ' ' + link(r.next.p, r.next.label) + ', ' + esc(T.planEnd) + '</p>' : '') + '</div>';
      h += '<div class="sioh-card"><span class="sioh-k">' + esc(T.freeLead) + '</span>' + link(r.free.p, nameOf(r.free.p), 'sioh-go sioh-alt') + '<p class="sioh-small">' + esc(r.free.why) + '</p></div>';
    } else {
      h += '<div class="sioh-card sioh-main" id="sioh-ask" tabindex="-1"><span class="sioh-k">' + esc(T.picksLead) + '</span><p>' + esc(r.why) + '</p>' + rows(r.picks) + '</div>';
      if (r.paid) h += '<div class="sioh-card"><span class="sioh-k">' + esc(T.paidLead) + '</span>' + link(r.paid.p, r.paid.label, 'sioh-go sioh-alt') + '<p class="sioh-small">' + esc(r.paid.why) + '</p></div>';
    }
    for (i = 0; i < r.notes.length; i++) h += '<p class="sioh-small">' + esc(r.notes[i].t) + (r.notes[i].p ? ' ' + link(r.notes[i].p) : '') + '</p>';
    if (r.also.length) { h += '<p class="sioh-small">' + esc(T.alsoLead) + ': '; for (i = 0; i < r.also.length; i++) h += (i ? ', ' : '') + link(r.also[i]); h += '</p>'; }
    if (r.main) h += '<p class="sioh-fine">' + esc(T.fine) + '</p>';
    return h + ending();
  }
  function screen() {
    var s = st.screen;
    if (s === 'who') return '<p>' + esc(T.hello) + '</p>' + ask(T.who) + opts(D.who);
    if (s === 'age') return ask(T.age) + opts(D.ages, true);
    if (s === 'prob') return ask(T.problem) + opts(D.problems);
    if (s === 'more') return ask(T.more) + opts(D.moreProblems);
    if (s === 'grade') return ask(T.grade) + opts(D.grades, true);
    if (s === 'need') return ask(T.need) + opts(D.needs);
    return result();
  }
  function render(focus) {
    body.innerHTML = trail() + screen();
    backBtn.style.visibility = hist.length ? 'visible' : 'hidden';
    body.scrollTop = 0;
    mem.st = st; mem.hist = hist; save();
    var a = document.getElementById('sioh-ask'), inp = document.getElementById('sioh-in');
    if (inp) inp.oninput = function () { showSearch(inp.value); };
    if (focus && a) a.focus();
  }
  function showSearch(q) {
    var box = document.getElementById('sioh-res'), list, slugs = [], i;
    if (!box) return;
    if (!q.replace(/\s+/g, '')) { box.innerHTML = ''; return; }
    list = search(q);
    if (!list.length) { box.innerHTML = '<p class="sioh-small">' + esc(T.searchNone) + '</p>'; return; }
    for (i = 0; i < list.length && i < 8; i++) slugs.push(list[i].p);
    box.innerHTML = '<p class="sioh-sr">' + list.length + ' pages found. Showing ' + slugs.length + '.</p>' + rows(slugs) + (list.length > 8 ? '<p class="sioh-fine">' + (list.length - 8) + ' more. Add a word to narrow it down.</p>' : '');
  }

  /* ---- open, close, keyboard ---- */
  function isOpen() { return !panel.hidden; }
  function open() { panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); render(true); }
  function close(quiet) { if (!isOpen()) return; panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (!quiet) btn.focus(); }
  function focusables() { var n = panel.querySelectorAll('button,a[href],input,[tabindex="0"]'), out = [], i; for (i = 0; i < n.length; i++) if (n[i].offsetParent !== null && n[i].style.visibility !== 'hidden') out.push(n[i]); return out; }
  function onKey(e) {
    if (!isOpen()) return;
    var k = e.key || e.keyCode, f, first, last, act;
    if (k === 'Escape' || k === 'Esc' || k === 27) { e.preventDefault(); close(); return; }
    if (k !== 'Tab' && k !== 9) return;
    f = focusables(); if (!f.length) return; first = f[0]; last = f[f.length - 1]; act = document.activeElement;
    if (!panel.contains(act) || (e.shiftKey && (act === first || act.id === 'sioh-ask')) ) { if (e.shiftKey) { e.preventDefault(); last.focus(); } else if (!panel.contains(act)) { e.preventDefault(); first.focus(); } }
    else if (!e.shiftKey && act === last) { e.preventDefault(); first.focus(); }
  }
  function onClick(e) {
    var t = e.target, v, act;
    while (t && t !== panel && !(t.getAttribute && (t.getAttribute('data-v') || t.getAttribute('data-act')))) t = t.parentNode;
    if (!t || t === panel) return;
    v = t.getAttribute('data-v'); act = t.getAttribute('data-act');
    if (v && NEXT[st.screen]) { hist.push(st.screen); st.screen = NEXT[st.screen](v); render(true); }
    else if (act === 'back' && hist.length) { st.screen = hist.pop(); render(true); }
    else if (act === 'again') { st = { screen: 'who' }; hist = []; render(true); }
    else if (act === 'close') close();
    else if (act === 'hide') { mem = { hide: 1 }; save(); close(true); root.parentNode.removeChild(root); document.removeEventListener('keydown', onKey, true); }
  }
  /* keep the button clear of a buy bar fixed to the bottom of a plan page */
  function lift() {
    var bars = document.querySelectorAll('.spbar'), up = 0, i, cs, r;
    for (i = 0; i < bars.length; i++) { cs = window.getComputedStyle(bars[i]); if (cs.position === 'fixed' && cs.display !== 'none') { r = bars[i].getBoundingClientRect(); if (r.height && r.bottom >= window.innerHeight - 4) up = Math.max(up, r.height); } }
    btn.style.bottom = up ? (up + 12) + 'px' : '';
  }
  function init() {
    if (document.getElementById('sioh')) return;
    var style = document.createElement('style'); style.appendChild(document.createTextNode(CSS)); document.head.appendChild(style);
    root = document.createElement('div'); root.className = 'sioh'; root.id = 'sioh';
    root.innerHTML = '<button type="button" class="sioh-btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="sioh-panel"><span class="sioh-q" aria-hidden="true"><img src="' + BASE + 'img/pals/owl.webp" alt="" width="72" height="72"><b>?</b></span><span class="sioh-lbl">' + esc(T.button) + '</span></button>' +
      '<div class="sioh-panel" id="sioh-panel" role="dialog" aria-modal="true" aria-labelledby="sioh-title" hidden>' +
      '<div class="sioh-head"><h2 id="sioh-title">' + esc(T.title) + '</h2><button type="button" class="sioh-x" data-act="close" aria-label="' + esc(T.close) + '"><span aria-hidden="true">&times;</span></button></div>' +
    setTimeout(function () { var bq = root.querySelector('.sioh-btn'); if (bq) bq.className += ' sioh-quiet'; }, 9000);
      '<div class="sioh-body" id="sioh-body"></div>' +
      '<div class="sioh-foot"><button type="button" class="sioh-link" data-act="back" id="sioh-back">' + esc(T.back) + '</button><button type="button" class="sioh-link" data-act="hide" style="font-weight:400!important;color:#55617a">' + esc(T.hide) + '</button></div></div>';
    document.body.appendChild(root);
    btn = root.firstChild; panel = document.getElementById('sioh-panel'); body = document.getElementById('sioh-body'); backBtn = document.getElementById('sioh-back');
    btn.onclick = open;
    panel.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('mousedown', function (e) { if (isOpen() && !root.contains(e.target)) close(true); });
    window.addEventListener('resize', lift); lift(); setTimeout(lift, 1200);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(SIOH_DATA);
