const input = document.getElementById("input");
const output = document.getElementById("output");
const codeinput = document.getElementById("code");

function validateCode(code){
    let passedopenbrackets = 0;
    let passedclosedbrackets = 0;
    let passedopenbracketsarr = [];
    let passedclosedbracketsarr = [];
    let validated = true;

    for (let i = 0; i < code.length; i++){
        if (code[i] == "[") {
            passedopenbrackets++;
            passedopenbracketsarr.push(i);
        }
        else if (code[i] == "]") {
            passedclosedbrackets++;
            passedclosedbracketsarr.push(i);
        }
    }

    if (passedopenbrackets > passedclosedbrackets) {
        output.value = "unmatched [";
        validated = false;
    }
    else if (passedclosedbrackets > passedopenbrackets){
        output.value = "unmatched ]";
        validated = false;
    }
    else{
        for (let i = 0; i < passedclosedbracketsarr.length; i++){
            if (passedopenbracketsarr[i] > passedclosedbracketsarr[i]){
                output.value = "] detected before [";
                validated = false;
                break;
            }
        }
    }
    return validated;
}

function runCode() {
    let code = codeinput.value;
    let validated = validateCode(code);
    let inputString = input.value;

    acceptedchrs = ["+", "-", "[", "]", ".", ",", ">", "<"];
    for(let c in code){
        if (!acceptedchrs.includes(c)) {
            code.replace(c, "");
        }
    }

    let inputindex = 0;
    let codeindex = 0;
    let memory = new Array(30000).fill(0);
    let memoryindex = 0;
    let loopindexes = [];

    if (validated){
        output.readOnly = false;
        output.value = "";
        while (codeindex < code.length){
            let char = code[codeindex];
            switch (char){
                case "+": memory[memoryindex] += 1; break;

                case "-": if (memory[memoryindex] > 0) {
                            memory[memoryindex]--;
                          }
                          break;

                case "[":
                    if (memory[memoryindex] == 0){
                        let tmpchar = code[codeindex];
                        let tempi = codeindex;
                        let openbrackets = 0;
                        while(true) {
                            if (tmpchar == "]" && openbrackets == 0) {
                                codeindex = tempi;
                                break;
                            }
                            else{
                                if (tmpchar == "]") {
                                    openbrackets--;
                                    tempi++;
                                    tmpchar = code[tempi];
                                }
                                else if (tmpchar == "[" && codeindex != tempi) {
                                    openbrackets++;
                                    tempi++;
                                    tmpchar = code[tempi];
                                }
                                else if (tempi != code.length - 1) {
                                    tempi++;
                                    tmpchar = code[tempi];
                                }
                            }
                        }
                    }
                    else {
                        loopindexes.push(codeindex);
                    }
                    break;

                case "]":
                    if (memory[memoryindex] == 0) {
                        loopindexes.pop();
                    }
                    else{
                        codeindex = loopindexes[loopindexes.length - 1];
                    }
                    break;

                case ".": output.value += String.fromCharCode(memory[memoryindex]); break;

                case ",":
                    if (inputindex == inputString.length){
                        memory[memoryindex] = 0;
                    }
                    else{
                        memory[memoryindex] = inputString[inputindex].charCodeAt(0);
                        inputindex++;
                    }
                    break;

                case ">": if (memoryindex == 29999) {
                            memoryindex = 0;
                          }
                          else{
                            memoryindex++;
                          } 
                          break;

                case "<": if (memoryindex == 0) {
                            memoryindex = 29999;
                          }
                          else{
                            memoryindex--;
                          } 
                          break;

            }
            codeindex++;
        }
    }
    output.readOnly = true;
}
output.readOnly = true;