//d100
const BIRTHNAMES = ["Ada","Agate","Agnes","Aloe","April","Azalea","Bay","Belladonna","Blossom","Brie","Brynn","Cherry","Claire",
                    "Crocus","Dahlia","Daisy","Else","Emerald","Erin","Grace","Gwendoline","Hazel","Heather","Hette","Holly",
                    "Hyacinth","Iris","Juniper","Lavender","Lily","Magnolia","Marigold","Marjoram","Myrtle","Odette","Olive",
                    "Opal","Pearl","Pepper","Poppy","Rosemary","Rue","Saffron","Sandy","Sassafras","Shale","Susan","Thistle",
                    "Violet","Willow","Alder","Ambrose","Anise","Annotto","August","Avens","Basil","Beryl","Birch","Boldo","Bill",
                    "Burdock","Butter","Cassia","Chicory","Clive","Colby","Dill","Dock","Eared","Edmund","Elmer","Ernest",
                    "Fennel","Festus","Francis","Gil","Hawthorn","Heath","Horatio","Jack","Jasper","Konrad","Larkspur","Laurel",
                    "Lorenz","Mace","Oliver","Orin","Reepicheep","Rowan","Simon","Sorrel","Stilton","Tarragon","Warren","Wattle",
                    "Whitacre","Wormwood","Yarrow"];
//d20
const MATRINAMES =    [ "Baiter","Black","Buckthorne","Burley","Butterball","Catreizen","Danger","Deerider","Grant","Halva","Maker",
                        "Pipp","Seedfall","Snow","Summerhome","Thorne","Tunneler","White","Winterholme","Witter"];
//d6, d8
const BRICABRACS =    [["1 pip","2 pips","3 pips","4 pips","5 pips","6 pips","7 pips","8 pips"],
                       ["Dried five-leaf clover, carefully folded","Stone pendant of the Mother","Stub of a pencil",
                        "Dried herbs in a waterproof bag","Wire bent in the shape of a moth","Letter of writ from a noblemouse",
                        "Smooth piece of colored glass","Half-eaten piece of cheese, wrapped in paper"],
                       ["Smoke-blackened bat tooth","Metal cup etched with hunting scenes",
                        "Oddly shimmering opal in silver wire setting","Knife cut from a tin can","Clay jar of thick honey mead",
                        "Bee stinger wired to wooden handle","Piece of candied berry","Butterfly wings pressed between parchment"],
                       ["Map showing treasure hidden in a settlement","Note from a cat lord regarding a player mouse",
                        "Wooden idol of centipede eating its own tail","Tooth of a human child","Pot of bright paint",
                        "Angry ant queen in a jar","Rolled tapestry depicting ancient battle",
                        "Ball of wet clay that never dries out"],
                       ["Lock of faerie's hair","Vial of red ink","Straw basket with leather carrying straps",
                        "Fragment of a spell tablet","Dried, poisonous mushroom","Pink plastic furbrush",
                        "Collection of dried leaves, bound with twine","Pipe carved of shell"],
                       ["Scrap of sheepskin","Quiver of silver-tipped arrows","Wreath of silver wire","Very strong magnet",
                        "Bouncy rubber ball","Fish leather satchel","Extremely spicy chili pepper","Fly preserved in tree sap"]];
//d6
const BIRTHSIGNS =    [["Star","Brave/Reckless"], ["Wheel","Industrious/Unimaginative"], ["Acorn","Inquisitive/Stubborn"],
                       ["Storm","Generous/Wrathful"], ["Moon","Wise/Mysterious"], ["Mother","Nurturing/Worrying"]];
//d6
const COATCOLORS =    ["Chocolate","Black","White","Tan","Grey","Blue"];
//d6
const COATPATTERNS =  ["Solid","Brindle","Patchy","Banded","Marbled","Flecked"];
//d6, d6
const PHYSICALDETAILS =   [["Scarred body","Corpulent body","Skeletal body","Willowy body","Tiny body","Massive body"],
                           ["War paint","Foreign clothes","Elegant clothes","Patched clothes","Fashionable clothes","Unwashed clothes"],
                           ["Missing ear","Lumpy face","Beautiful face","Round face","Delicate face","Elongated face"],
                           ["Groomed fur","Dreadlocks","Dyed fur","Shaved fur","Frizzy fur","Silky fur"],
                           ["Night black eyes","Eye patch","Blood red eyes","Wise eyes","Sharp eyes","Luminous eyes"],
                           ["Cropped tail","Whip-like tail","Tufted tail","Stubby tail","Prehensile tail","Curly tail"]];
//d6, d6
const BACKGROUNDS =   [[["Test subject","Spell: Magic missle","Lead coat (Heavy armor)"],
                        ["Kitchen forager","Sheild and jerkin (Light armor)","Cookpots"],
                        ["Cage dweller","Spell: Be understood","Bottle of milk"], ["Hedge witch","Spell: Heal","Incense stick"],
                        ["Leatherworker","Shield and Jerkin (Light armor)","Shears"],
                        ["Street tough","Dagger (Light, d6)","Flask of coffee"]],
                       [["Mendicant priest","Spell: Restore","Holy symbol"], ["Bettleherd","Hireling: Loyal beetle","Pole (6 inches)"],
                        ["Ale brewer","Hireling: Drunken torchbearer","Small barrel of ale"],
                        ["Fishermouse","Net","Neddle (Light, d6)"], ["Blacksmith","Hammer (Medium, d6/d8)","Metal File"],
                        ["Wireworker","Spool of wire","Electric lantern"]],
                       [["Woodcutter","Axe (Medium, d6/d8)","Spool of twine"], ["Bat cultist","Spell: Darkness","Bag of bat teeth"],
                        ["Tin miner","Pickaxe (Medium, d6/d8)","Lantern"], ["Trash collector","Trashhook (Heavy, d10)","Mirror"],
                        ["Wall rover","Fishhook","Spool of thread"], ["Merchant","Hireling: Pack rat","20p IOU from a noblemouse"]],
                       [["Raft crew","Hammer (Medium, d6/d8)","Wooden spikes"], ["Worm wrangler","Pole (6 inches)","Soap"],
                        ["Sparrow rider","Fishhook","Spool of thread"], ["Sewer guide","Metal file","Spool of thread"],
                        ["Prison guard","Chain (6 inches)","Spear (Heavy, d10)"], 
                        ["Fungus farmer","Dried mushroom (as rations)","Spore mask"]],
                       [["Dam builder","Shovel","Wooden spikes"], ["Cartographer","Quill & ink","Compass"],
                        ["Trap thief","Block of cheese","Glue"], ["Vagabond","Tent","Treasure map (dubious)"],
                        ["Grain farmer","Spear (Heavy, d10)","Whistle"], ["Message runner","Bedroll","Documents (sealed)"]],
                       [["Troubador","Musical instrument","Disguise kit"], ["Gambler","Set of loaded dice","Mirror"],
                        ["Sap tapper","Bucket","Wodden spikes"], ["Bee keeper","Jar of honey","Net"],
                        ["Librarian","Scrap of obscure book","Quill & ink"], ["Pauper noblemouse","Felt hat","Perfume"]]];


const randint = (min, max) => { return Math.floor(Math.random() * (max+1-min) + min); }
const textarea = document.getElementById("mice");
var numMice = 1;

function generateName() {
    return BIRTHNAMES[randint(0,99)] + " " + MATRINAMES[randint(0,19)];
}
//Enter unadjusted result on dice
function lookupName(d100, d20) {
    return BIRTHNAMES[d100-1] + " " + MATRINAMES[d20-1];
}

function generateBackground() {
    return BACKGROUNDS[randint(0, 5)][randint(0, 5)];
}
//Enter unadjusted result on dice
function lookupBackground(d6_1, d6_2) {
    return BACKGROUNDS[d6_1-1][d6_2-1];
}

function generateBirthsign() {
    return BIRTHSIGNS[randint(0,5)].join(" ");
}
//Enter unadjusted result on dice
function lookupBirthsign(d6) {
    return BIRTHSIGNS[d6-1].join(" ");
}
function generateCoat() {
    return COATPATTERNS[randint(0,5)] + " " + COATCOLORS[randint(0,5)];
}
//Enter unadjusted result on dice
function lookupCoat(d6_1, d6_2) {
    return COATPATTERNS[d6_1-1] + " " + COATCOLORS[d6_2-1]
}

function generateDetail() {
    return PHYSICALDETAILS[randint(0,5)][randint(0,5)];
}
//Enter unadjusted result on dice
function lookupDetail(d6_1, d6_2) {
    return PHYSICALDETAILS[d6_1-1][d6_2-1];
}

function generateBricaBrac() {
    return BRICABRACS[randint(0,5)][randint(0,7)];
}
//Enter unadjusted result on dice
function lookupBricaBrac(d6, d8) {
    return BRICABRACS[d6-1][d8-1];
}

function generateAttribute() {
    let temparr = [randint(1,6),randint(1,6),randint(1,6)];
    temparr.sort();
    return (temparr[1] + temparr[2]) + "";
}

function generateMice() {
    textarea.value = "";
    for (let n = 0; n < numMice; n++) {
        let birthname_roll = randint(1, 100);
        let matriname_roll = randint(1, 20);
        let name = lookupName(birthname_roll, matriname_roll);
        let gender = birthname_roll > 50 ? "M" : "F";
        let attributes = [generateAttribute(), generateAttribute(), generateAttribute()].join(" ");
        let hp = randint(1,6);
        let pips = randint(1,6);
        let background = lookupBackground(hp, pips);
        let equipment = ["Torches","Rations","Weapon of choice",background[1],background[2]].join(", ");
        let occupation = background[0];
        let birthsign_disposition = generateBirthsign();
        let coat = generateCoat();
        let physicaldetail = generateDetail();
        let bricabrac = generateBricaBrac();
        textarea.value += ("Mouse # {0}\n--------------\nName: {1} ({2})\nAttributes: {3}\nHP: {4}\nPips: {5}\nEquiment: {6}\nBric-a-brac: {7}\nBackground: {8}\nBirthsign and Disposition: {9}\nCoat: {10}\nPhysical Details: {11}\n\n".format(n+1,name,gender,attributes,hp,pips,equipment,bricabrac,occupation,birthsign_disposition,coat,physicaldetail))
    }
}

function numMiceChange() {
    t = document.getElementById("numMice").value;

    if (t == "" || t < 1){
        numMice = 1;
        document.getElementById("numMice").value = 1;
    }
    else if (t > 20){
        numMice = 20;
        document.getElementById("numMice").value = 20;
    }
    else{
        numMice = parseInt(t, 10);
    }
}

String.prototype.format = function() {
    let formatted = this;
    for (let i = 0; i < arguments.length; i++) {
        let regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};