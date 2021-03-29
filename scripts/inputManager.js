import  {controlsFunctions} from "/scripts/controls.js";
var inputManger;

function inputManagerUpdate () {
    inputManger = {
        horizontal: input.linear(controlsFunctions.simpleGetKey("d"), controlsFunctions.simpleGetKey("a")),
        vertical: input.linear(controlsFunctions.simpleGetKey("w"), controlsFunctions.simpleGetKey("s")),

        camera: {
            horizontal: controlsFunctions.getMouseAxis("horizontal"),
            vertical: controlsFunctions.getMouseAxis("vertical")
        }
    }
}


var input = {
    singular: (direction = false) => {
        return direction1? 1: 0;
    },
    linear: (direction1 = false, direction2 = false) => {
        return direction1 && direction2? 0: 
               direction1? -1:
              direction2? 1: 0;
    }
}

export {inputManger, input, inputManagerUpdate};