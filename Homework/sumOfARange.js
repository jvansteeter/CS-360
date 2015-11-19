var range = function(start, end)
{
    var ran = [];
    for(var i = start; i <= end; i++)
    {
     	ran.push(i);   
    }
    return ran;
};

var sum = function(range)
{
 	var sum = 0;
    for(var i = 0; i < range.length; i++)
    {
        sum += range[i];   
    }
    return sum;
}

console.log(sum(range(1, 10)));