var Node = function(val)
{
	this.value = val;
	this.next = null;
	this.append = function(val)
	{
		if(this.next === null)
		{
			var node = new Node(val);
			this.next = node;
		}
		else
		{
			this.next.append(val);
		}
	};
};

var List = function()
{
	this.node = null;
	this.length = 0;
	this.push = function(val)
	{
		if(this.node === null)
		{
			this.node = new Node(val);
			this.length = 1;
		}
		else
		{
			this.node.append(val);
			this.length++;
		}
	};
	this.prepend = function(val)
	{
		var newNode = new Node(val);
		newNode.next = this.node;
		this.node = newNode;
		this.length++;
	}
	this.get = function(index)
	{
		var it;
		it = this.node;
		for(var i = 0; i < index; i++)
		{
			it = it.next;
			if(it === null)
			{
				return "undefined";
			}
		}
		return it.value;
	};
};

var arrayToList = function(array)
{
	var myList = new List();
	for(var i = 0; i < array.length; i++)
	{
		myList.push(array[i]);
	}
	return myList;
};

var prepend = function(val, list)
{
	if(list === null)
	{
		list = new List()
	}
	list.prepend(val);
	return list;
}

var nth = function(list, index)
{
	return list.get(index);
}

var listToArray = function(list)
{
	var array = [];
	for(var i = 0; i < list.length; i++)
	{
		array[i] = list.get(i);
	}
	return array;
}

console.log(arrayToList([10, 20]));

console.log(listToArray(arrayToList([10, 20, 30])));

console.log(prepend(10, prepend(20, null)));

console.log(nth(arrayToList([10, 20, 30]), 1));