function pointsToPath(points){
    let fullPath, path;
    if(points.length === 0){
        fullPath = [];
        path = [];
    }
    else
    {
        // to path list
        let start = points[0];
        path = findPath(points, start);
        // find path from the other direction
        path2 = findPath(points, start);

        path = path2.reverse().concat(path);

        fullPath = [...path];
        /*for(let iter = 0; iter < 20; iter++){
            for(let i = 1; i < path.length - 1; i += 2) {
                // cos = (a^2+b^2-c^2)/2ab
                let a2 = sqrDist(path[i - 1], path[i]);
                let b2 = sqrDist(path[i], path[i + 1]);
                let c2 = sqrDist(path[i - 1], path[i + 1]);
                let cos = (a2 + b2 - c2) / (2 * (a2 * b2) ** 0.5);
                
                if(cos < -0.95 || a2 < 15 ** 2 || b2 < 15 ** 2)
                    path.splice(i, 1);
            }
        }*/
        // reduce number of points in path
        path = douglasPeuckerCurveDecimation(path, 6);
        //console.log(path);
        /*console.log(path);
        let [i, d] = closestIndexToLine(path[0], path[path.length - 1], path.slice(1, path.length - 1));
        console.log(path[0], path[path.length - 1], path[i], d);*/
        
    }

    return [fullPath, path];
}

function findPath(points, start){
    let path = [start];
    while(points.length > 0){
        let lastPoint = path[path.length - 1];
        // find closest point
        let i = getNearestIndex(points, lastPoint);
        if(sqrDist(lastPoint, points[i]) > 100 ** 2)
            break;
        path.push(points[i]);
        points.splice(i, 1);
    }
    return path;
}

function douglasPeuckerCurveDecimation(path, epsilon){
    let a = path[0], b = path[path.length - 1];
    let [i, d] = furthestIndexFromLine(a, b, path.slice(1, path.length - 1));
    i += 1;
    if(d < epsilon)
        return [a, b];     // a,b are a good approximation, all points can be removed
    else{
        let result1 = douglasPeuckerCurveDecimation(path.slice(0, i + 1), epsilon);
        let result2 = douglasPeuckerCurveDecimation(path.slice(i, path.length), epsilon);

        return result1.slice(0, result1.length - 1).concat(result2);
    }
}

// a, b: two points defining a line
function furthestIndexFromLine(a, b, points){
    let maxDistance = 0;
    let maxIndex = 0;
    const d0 = b[0] - a[0], d1 = b[1] - a[1];
    const denominator = Math.sqrt(d0 * d0 + d1 * d1);
    for(let i = 0; i < points.length; i++){
        let distance = Math.abs(d0 * (a[1] - points[i][1]) - d1 * (a[0] - points[i][0])) / denominator;
        if(distance > maxDistance){
            maxDistance = distance;
            maxIndex = i;
        }
    }
    return [maxIndex, maxDistance];
}

function drawPath(pathData, toCanvas){
    let ctx = toCanvas.getContext("2d");
    let [outline, path] = pathData;
    if(path.length === 0)
        return;

    // delete details near outline
    ctx.beginPath();
    ctx.lineWidth = 15;
    ctx.strokeStyle = '#fff';
    ctx.moveTo(...outline[0]);
    for(let i = 1; i < outline.length; i++){
        ctx.lineTo(...outline[i]);
    }
    ctx.stroke();

    // draw path
    ctx.lineWidth = 1;

    ctx.strokeStyle = '#000';
    ctx.font = '11px Arial';
    for(let i = 0; i < path.length - 1; i++){
        ctx.fillText(i + 1, path[i][0] + 2.5, path[i][1] + 1);
        ctx.beginPath();
        ctx.arc(path[i][0], path[i][1], 3, 0, 360);
        ctx.stroke();
    }
}
