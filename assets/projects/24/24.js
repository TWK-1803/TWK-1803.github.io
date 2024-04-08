//Note that this program does not exhaustively search every possibility. Some may be marked not possible incorrectly
var maxNum = 6;
var goal = 24;
const factorials = {0:1, 1:1, 2:2, 3:6, 4:24, 5:120, 6:720, 7:5040};
const symbols = {0:"+", 1:"-", 2:"*", 3:"/", 4:"+", 5:"-", 6:"*", 7:"/"};

var factorialAllowed = true;

const textarea = document.getElementById("answers");

function answer(lst) {
    //The arrangement of parenthesis is specific to 4 items, but could be abstracted an generalized if needed.
    //adding factorials would require a significant rework of this as they can be applied anywhere at any time.
    let permuations = ["{0}{1}{2}{3}{4}{5}{6}",        //abcd
                       "{0}{1}{2}{3}({4}{5}{6})",      //ab(cd)
                       "{0}{1}({2}{3}{4}){5}{6}",      //a(bc)d
                       "({0}{1}{2}){3}{4}{5}{6}",      //(ab)cd
                       "({0}{1}{2}){3}({4}{5}{6})",    //(ab)(cd)
                       "({0}{1}{2}{3}{4}){5}{6}",      //(abc)d
                       "{0}{1}({2}{3}{4}{5}{6})",      //a(bcd)
                       "(({0}{1}{2}){3}{4}){5}{6}",    //((ab)c)d
                       "({0}{1}({2}{3}{4})){5}{6}",    //(a(bc))d
                       "{0}{1}(({2}{3}{4}){5}{6})",    //a((bc)d)
                       "{0}{1}({2}{3}({4}{5}{6}))"];    //a(b(cd))
    
    // The various indexes at each layer of the nested array where the goal is found tells you
    // what operation was chosen at each step, useful for extracting that information to build 
    // a string for the formula which reaches the goal. Not possible to shortcut except at the last
    // layer for this implementation
    let a = lst[0];
    let b = lst[1];
    let c = lst[2];
    let d = lst[3];
    let cd = op(c,d);
    let bcd = [];
    for(let x in cd) {
        bcd.push(op(b, x));
    }
    let abcd = [];
    bcd.forEach(x => {
        let f = [];
        for(let l in x) {
            f.push(op(a,l));
        }
        abcd.push(f);
    });

    let result = "";
    //a k b j c i d
    for(let i = 0; i < abcd.length; i++) {
        for(let j = 0; j < abcd[i].length; j++) {
            for(let k = 0; k < abcd[i][j].length; k++) {
                // Possible swaps
                let order = [a, b, c, d];
                if (k > 3) {
                    old_index = order.indexOf(a);
                    order.splice(old_index, 1);
                    order.splice(old_index+3, 0, a);
                }
                if (j > 3) {
                    old_index = order.indexOf(b);
                    order.splice(old_index, 1);
                    order.splice(old_index+2, 0, b);
                }
                if (i > 3) {
                    old_index = order.indexOf(c);
                    order.splice(old_index, 1);
                    order.splice(old_index+1, 0, c);
                }
                    
                for(let perm = 0; perm < permuations.length; perm++){
                    let test = permuations[perm].format(order[0],symbols[k],order[1],symbols[j],order[2],symbols[i],order[3]);
                    try{ 
                        let s = eval(test);
                        if (s == goal) {
                            return test;
                        }
                        else if (factorialAllowed && factorials[s] == goal) {
                            return "("+test+")!";
                        }
                    }
                    catch{}
                }
            }
        }
    }
    return result;
}

// Factorials are only counted when using one on the final result produces the goal due to the uneccessary complexity
// they would add for my use case. Including them is perfectly feasable, but outside the scope of what I was seeking to do
function op(a, b) {
    if (a != 0 && b != 0) {
        return [+a + +b, +a - +b, +a * +b, +a / +b, +b + + a, +b - +a, +b * +a, +b / +a];
    }
    else if (a == 0 && b != 0) {
        return [b, -b, 0, 0, b, b, 0, Infinity];
    }
    else if (a != 0 && b == 0) {
        return [a, a, 0, Infinity, a, -a, 0, 0];
    }
    else{
        return [0, 0, 0, Infinity, 0, 0, 0, Infinity];
    }
}

function getanswer(lst) {
    let a = lst[0];
    let b = lst[1];
    let c = lst[2];
    let d = lst[3];

    // There are 24 ways to arrange 4 items but defining that many permutations here is ultimately unneccessary
    // Given 4 items, there are 6 ways of choosing 2. Each has a pair that completes the set perfectly. Since the 
    // op function takes care of the permutations where the items within the pairs are swapped, all that is left
    // is to write the 3 pairs of possible ways to choose 2 with the pairs in either position: yielding the 6 here
    let permutations = [[a,b,c,d],
                        [c,d,a,b],
                        [a,c,b,d],
                        [b,d,a,c],
                        [a,d,b,c],
                        [b,c,d,a]];
    for(let i = 0; i < permutations.length; i++) {
        let t = answer(permutations[i]);
        if (t != "") {
            return t;
        }
    }
    return "Impossible";
}

function generateAnswers() {
    textarea.value = "";
    console.log("Clicked")
    for(let i = 1; i < maxNum + 1; i++) {
        for(let j = i; j < maxNum + 1; j++) {
            for(let k = j; k < maxNum + 1; k++) {
                for(let l = k; l < maxNum + 1; l++) {
                    textarea.value += "{0} {1} {2} {3}: {4}\n".format(i, j, k, l, getanswer([i, j, k, l]));
                }
            }
        }
    }
}

function goalChange() {
    t = document.getElementById("goal").value;

    if (t == ""){
        t = 0;
        document.getElementById("goal").value = 0;
    }
    else if (t < -9999){
        t = -9999;
        document.getElementById("maxNum").value = -9999;
    }

    else if (t > 9999){
        t = 9999;
        document.getElementById("goal").value = 9999;
    }

    goal = t;
}

function maxNumChange() {
    t = document.getElementById("maxNum").value;

    if (t == "" || t < 1){
        t = 1;
        document.getElementById("maxNum").value = 1;
    }
    else if (t > 13){
        t = 13;
        document.getElementById("maxNum").value = 13;
    }

    maxNum = t;
}

function factorialsAllowedChanged(){
    factorialAllowed = !factorialAllowed;
}

String.prototype.format = function() {
    let formatted = this;
    for (let i = 0; i < arguments.length; i++) {
        let regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};