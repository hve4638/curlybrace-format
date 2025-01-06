export function locateInText(text:string) {
    const lines = text.split('\n');

    return (position:number)=>{
        let row = 0;
        let column = 0;
        for (const line of lines) {
            if (position <= line.length) {
                column = position;
                break;
            }
    
            position -= line.length;
            row += 1;
            column = line.length;
        }
        return [row, column] as [number, number];
    }
}

