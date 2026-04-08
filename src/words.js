// Common 4-letter English words — used as embedded fallback dictionary.
// The app fetches a fuller list (ENABLE word list) at runtime and caches it.
export const FALLBACK_WORDS = [
  'able','ache','acid','acme','acre','acts','aged','aide','aims','airs',
  'ajar','akin','aloe','also','alto','amok','anew','ante','anti','ants',
  'apex','arch','area','aria','arid','arms','army','arts','atom','atop',
  'aunt','auto','avid','away','awed','awry','axle',
  'back','bade','bail','bait','bake','bald','bale','ball','balm','band',
  'bane','bang','bank','bard','bare','bark','barn','base','bash','bask',
  'bath','bats','bead','beam','bean','bear','beat','been','beer','beet',
  'bell','belt','bend','bent','best','bias','bide','bike','bile','bill',
  'bind','bite','bled','blew','blob','blow','blue','blur','boat','bold',
  'bolt','bond','bone','book','boom','boot','bore','born','both','bowl',
  'brag','brat','brew','brim','brow','bulb','bulk','bull','bump','bunk',
  'burn','burp','bush','busy','byte',
  'cage','cake','call','calm','came','camp','cane','card','care','cart',
  'case','cash','cast','cave','cell','cent','chat','chew','chin','chip',
  'chop','cite','city','clam','clan','clap','clay','clip','clod','clue',
  'coal','coat','code','coif','coil','coin','cold','colt','come','cone',
  'cook','cool','cope','cord','core','cork','corn','cost','cove','crab',
  'crew','crop','crow','cube','curl','cute',
  'dale','dame','damp','dare','dark','data','date','dawn','dead','deal',
  'dean','dear','deck','deed','deep','deft','dell','dent','desk','diet',
  'dire','dirt','disc','dish','disk','dive','dock','does','dole','done',
  'doom','dote','dove','down','drag','draw','drip','drop','drum','duck',
  'dull','dune','dunk','dusk','dust',
  'each','earl','earn','ease','east','edge','else','emit','envy','epic',
  'even','ever','evil','exam','eyes',
  'face','fact','fade','fail','fair','fake','fame','fang','farm','fast',
  'fate','fawn','fear','feat','feed','feel','feet','fell','felt','fend',
  'fern','fill','film','find','fine','firm','fish','fist','flag','flat',
  'flaw','flea','flew','flip','flow','foam','fold','folk','fond','food',
  'fool','foot','ford','fore','fork','form','fort','foul','four','free',
  'from','fuel','full','fume','fund','funk','fuss',
  'gale','game','gang','gasp','gate','gave','gaze','gear','gent','gild',
  'girl','give','glad','glee','glow','glue','gnaw','goad','goal','goat',
  'gold','gone','good','gore','grab','grew','grid','grin','grip','grit',
  'gust','guts',
  'hack','hail','hair','half','hall','halt','hand','hang','hard','hare',
  'harm','harp','hash','hate','have','hawk','heal','heap','hear','heat',
  'heel','help','here','hero','hide','high','hill','hilt','hive','hole',
  'holy','home','hood','hook','hope','horn','hose','host','huff','huge',
  'hull','hunt','hurt','husk',
  'idle','inch','into','iron','isle',
  'jack','jade','jail','jest','join','joke','jolt','jump','just',
  'keen','keep','kill','kind','king','knob','knot','know',
  'lack','laid','lame','lamp','land','lane','lard','lark','lash','last',
  'late','laud','lava','lawn','lead','leaf','lean','leek','left','lend',
  'lens','lest','levy','liar','lick','life','lift','lime','limp','line',
  'lion','list','live','load','loam','lock','loft','loin','lone','long',
  'look','loop','lore','lose','lost','loud','love','lure','lurk','lust',
  'made','maid','mail','main','make','male','mall','malt','mane','mare',
  'mark','mart','mash','mast','mate','maze','meal','mean','meat','meet',
  'melt','mere','mesh','mild','mile','milk','mill','mind','mine','mint',
  'mire','miss','mist','moat','mode','mole','mood','moon','more','most',
  'moth','move','much','muck','mule','muse','myth',
  'nail','name','navy','near','neat','need','nest','news','nice','nick',
  'nine','node','none','noon','nook','norm','nose','note','numb',
  'oath','once','only','open','oral','oven','oval','over','owns',
  'pace','pack','page','paid','pain','pale','palm','pang','park','part',
  'pass','past','pave','peak','peel','peer','pelt','perk','pest','pine',
  'pink','pipe','plan','play','plot','ploy','plug','plum','plus','poke',
  'pole','pond','pore','port','pose','post','pour','prey','pull','pump',
  'pure','push',
  'race','rack','rage','raid','rail','rain','rake','ramp','rang','rank',
  'rare','rash','rate','rave','read','real','reap','reel','rein','rely',
  'rend','rent','rest','rice','rich','ride','rift','ring','rink','rise',
  'risk','roam','roar','robe','rock','rode','roll','room','root','rope',
  'rose','rout','rove','rude','ruin','rule','ruse','rush','rust',
  'safe','sage','sail','sake','sale','salt','same','sand','sane','sang',
  'save','scan','scar','seat','seed','seep','sell','send','sent','shed',
  'shin','ship','shoe','shop','shot','show','shut','sick','sift','sigh',
  'silk','sill','sing','sink','site','skin','skip','slim','slip','slow',
  'slug','snap','snip','snow','soak','soar','sock','soil','sold','sole',
  'some','song','sore','sort','soul','soup','sour','span','spar','spin',
  'spit','spot','stem','step','stew','stir','stop','stub','stun','suit',
  'sulk','sunk','sure','surf','swap','sway','swim',
  'tack','tail','tale','talk','tall','tame','tang','tank','tape','task',
  'teal','team','tear','tell','tend','term','test','thin','tide','tier',
  'till','tilt','time','tire','toad','told','toll','tome','tone','tool',
  'tore','torn','toss','tour','town','trek','trim','trio','trip','trot',
  'true','tune','turf','turn','tusk',
  'ugly','undo','upon','urge','used',
  'vain','vale','vane','vast','veil','vein','vent','vest','veto','view',
  'vile','vine','void','vote',
  'wade','wage','wake','walk','wall','wand','wane','ward','warm','warp',
  'wash','wasp','wave','weak','weal','wean','weed','week','well','welt',
  'went','wept','west','wide','wild','will','wilt','wine','wing','wink',
  'wire','wise','wish','wolf','wood','wool','word','wore','work','worm',
  'wrap','wren','writ',
  'yard','yarn','yawn','year','yell','yelp','yore',
  'zeal','zero','zinc','zone','zoom',
  // Extra words for better BFS connectivity
  'aced','aces','acne','alms','ammo','anon','apes','apse','arch','arcs',
  'aver','avow','bale','bane','bars','bays','beds','bees','bide','bier',
  'bins','bode','bogs','bops','bosh','buds','bugs','bums','buns','buts',
  'cabs','cads','calf','calk','caps','cars','cats','cede','chid','chug',
  'clef','clew','clog','cobs','cods','cols','cops','cots','cows','cozy',
  'cram','crux','cubs','cups','cuts','cyst',
  'dabs','dais','dash','daze','dens','ding','dint','disc','dogs','dolt',
  'dopy','drub','duds','duel','dues','duly','dumb','dump',
  'edgy','effs','eggs','elms','ends','eons','ergo','erne','errs','erst',
  'espy','etch',
  'fads','faze','feds','fief','figs','flab','flan','flay','flex','flit',
  'floe','flop','flux','fogy','fray','froe','frog','fuze',
  'gabs','gags','gaps','gars','gels','gems','gins','gist','glen','gobs',
  'gods','gosh','grim','grub','guff',
  'hams','haps','haze','hazy','herd','hewn','hobs','hods','hogs','hops',
  'howl','hubs','hued','hues','hugs','hump','hung',
  'icky','inks','inky','ions','ires',
  'jabs','jags','jams','jars','jaws','jays','jazz','jibe','jigs','jink',
  'jive','jogs','jots','jugs','junk',
  'kegs','kelp','kens','keys','kids','kink','kins','kith','knap','knew',
  'kobs','kola',
  'labs','lacs','lags','laps','lass','lavs','laze','lazy','legs','lets',
  'leys','libs','lids','lieu','lingo','lobs','logs','lops','lore',
  'mabs','macs','mags','maps','mars','mats','maws','mazy','meds','meek',
  'meld','mess','mews','mice','miff','mill','mins','mirs','mobs','mock',
  'mods','mogs','mops','moss','mots','mows','muds','mugs','mums','muss',
  'nabs','nags','naps','nark','nave','nays','nebs','nils','nips','nite',
  'nobs','nods','nogs','nope','nosh',
  'oafs','oaks','oars','oast','oats','oboe','odds','odor','offs','oils',
  'okay','okra','omen','once','ooze','orbs','ores','orgy',
  'pabs','pads','pals','pans','paps','pars','pats','paws','pays','peas',
  'pegs','pens','pets','pews','phat','pigs','pins','pits','plus','pods',
  'pops','pots','pows','prey','prys','pubs','puds','pug','pugs','puns',
  'pups','pus','puts',
  'rabs','rads','rags','raps','rats','rays','rebs','reds','refs','rems',
  'reps','revs','ribs','rids','rigs','rims','rips','rods','robs','rogs',
  'rubs','rugs','rums','runs','ruts',
  'sabs','sacs','sags','saps','saws','says','sebs','secs','sets','sews',
  'shag','shim','shin','shiv','shod','shop','slab','slap','slat','slid',
  'slog','slum','slur','smog','smug','snag','snob','snod','snot','snub',
  'sobs','sods','sons','sops','sots','sows','subs','suds','sum','sums',
  'suns','sups','tabs','tads','tags','tans','taps','tars','tats','taws',
  'teds','tens','tubs','tugs','tuns',
  'vans','vars','vats','vavs','vaws','vids','vies','vigs','vims','vins',
  'vips','wabs','wads','wags','waps','wars','wats','wavs','webs','weds',
  'wigs','wins','wits','woes','wogs','wops','wots','yaks','yams','yaps',
  'yens','yeps','yews','yids','yins','yips','yobs','yods','yoks','yore',
  // More words for connectivity
  'abut','acyl','aeon','aery','agog','ague','ahoy','alew','alga','amid',
  'amis','anal','ands','anew','anna','anus','apex','aped','apes','apio',
  'arco','arks','aryl','asci','aver','avis','avow','awes','awls','axes',
  'bait','balk','bane','bing','birl','blab','blah','bock','bole','boll',
  'bolm','bort','bosh','bout','brow','bubo','buna','burl','burr','calk',
  'calx','carn','cere','chai','char','char','chia','chid','chit','chow',
  'clag','claw','cloy','coax','cobs','colon','comp','conk','cony','coo',
  'coon','coop','coos','cots','coup','crew','crit','croc','cull','curd',
  'dale','dank','darn','deme','deni','dent','ding','dire','dock','dour',
  'drab','dray','drew','drib','drub','drub','drub','duff','duos','dupe',
  'ecru','edgy','egad','egal','egis','egad','emit','epee','euro',
  'fain','fare','feck','fend','fere','feta','feud','fief','fifo','fink',
  'flab','flan','flex','flog','flub','fob','fogy','fond','froe','frug',
  'gall','ghat','gibe','gink','glee','glim','glob','glogg','glop','glow',
  'gnar','gnaw','goop','gory','gosh','gout','gown','goys','grok','grow',
  'grub','gulf','gulk','gull','gulp','guru','gybe','gyms','gyve',
  'hade','haik','hale','halm','hale','hank','haps','hasp','haze','heil',
  'helm','herp','hewn','hick','hoar','hobo','hokey','hole','holm','holt',
  'homer','homo','hood','hoof','hoop','hora','hose','howl','hull','hype',
  'imps','inca','inch','inia','inky','iris','iwis',
  'jamb','jato','jaup','jibs','jink','joes','joey','jogs','jowl','jugs',
  'kale','kayo','kerf','kern','kibble','kier','kilt','kine','kirn','knar',
  'lace','lacy','lain','lard','laze','leam','lear','lehr','leno','levy',
  'lido','lien','lieu','lima','limb','limy','linx','loca','loge','loon',
  'lope','lour','lout','lube','luce','lude','luge','luna','lung','lute',
  'mace','mazy','mead','meow','mere','mesa','mete','mhos','mica','midi',
  'migg','mimo','moil','mold','molt','monk','mope','moue','mown','muse',
  'naan','nabe','naif','nard','nave','nett','newt','nibs','noel','noir',
  'nosy','nowt','nude','null',
  'odds','okeh','oleo','ones','orbs','orle','owns',
  'pace','paca','pacs','pacs','paca','para','pare','parr','pate','pave',
  'pawn','pawl','peel','peen','peri','phat','pick','pier','pika','pile',
  'pill','pine','pion','plod','plot','plow','plod','plop','plow','pock',
  'poll','polo','pomo','pool','poon','poop','pore','pork','prom','prop',
  'prow','punk','punt','puny','purl','purr','pyro',
  'raid','ramp','ream','reed','rein','rely','rime','rind','rink','roil',
  'romp','rood','rook','rote','rump','rune',
  'sack','saga','sage','sago','salp','samp','sari','sate','saul','sawm',
  'scab','scam','scud','scum','seam','sect','semi','sera','sewn','shah',
  'shag','sham','shim','shin','shiv','shod','shog','shop','shrew','siren',
  'skid','ski','skim','skit','skop','sley','slid','slim','slob','slop',
  'slub','slue','smew','snag','snap','snit','snob','snod','snot','snub',
  'soapm','sock','soma','sone','sonly','soot','souk','sowl','spec','spew',
  'spiv','spud','spue','spur','stab','star','stoa','stob','stoem','stow',
  'stub','stye','suer','sumo','sung','swam','swan','swat','swob',
  'tace','tack','taco','tarn','taupe','taws','teak','teel','teem','tern',
  'they','thud','thug','tick','tier','tiff','ting','tins','tithe','tome',
  'tong','toot','tope','tors','tort','tosh','toss','town','trap','trim',
  'trio','trog','troy','trub','tuft','tule','tuna',
  'udos','ulna','umph','unco','unit',
  'vamp','vang','veer','vera','verb','vers','vicar','vice','vim','vina',
  'vino','visa','vole','volt',
  'wail','waif','wale','walk','wank','warp','waul','weal','wear','wedge',
  'ween','weep','weir','welk','whet','whew','whey','whin','whip','whir',
  'whiz','wick','wig','wine','whit','whoa','whom','wice','yell',
  'yogi','yoyo','yuck','yule',
  'ziti','zonk',
];

// Full word set will be loaded from cache or remote and merged with fallback
let wordSet = null;

export function getWordSet() {
  return wordSet;
}

export function setWordSet(set) {
  wordSet = set;
}

const WORD_LIST_URL = 'https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt';
const CACHE_KEY = 'chainword_wordlist';
const CACHE_DATE_KEY = 'chainword_wordlist_date';
const CACHE_TTL_DAYS = 30;

export async function loadWordList() {
  // Try localStorage cache first
  const cachedDate = localStorage.getItem(CACHE_DATE_KEY);
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached && cachedDate) {
    const age = (Date.now() - Number(cachedDate)) / (1000 * 60 * 60 * 24);
    if (age < CACHE_TTL_DAYS) {
      const words = new Set(cached.split(','));
      setWordSet(words);
      return words;
    }
  }

  // Use fallback immediately so the game can start
  const fallback = new Set(FALLBACK_WORDS);
  setWordSet(fallback);

  // Try to fetch full word list in background
  try {
    const res = await fetch(WORD_LIST_URL);
    if (!res.ok) throw new Error('fetch failed');
    const text = await res.text();
    const all4 = text
      .split('\n')
      .map(w => w.trim().toLowerCase())
      .filter(w => /^[a-z]{4}$/.test(w));
    const full = new Set([...FALLBACK_WORDS, ...all4]);
    setWordSet(full);
    try {
      localStorage.setItem(CACHE_KEY, all4.join(','));
      localStorage.setItem(CACHE_DATE_KEY, String(Date.now()));
    } catch (_) { /* storage might be full */ }
    return full;
  } catch (_) {
    return fallback;
  }
}
