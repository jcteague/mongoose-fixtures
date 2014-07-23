mongoose-fixture-prep
=====================

This module has only one purpose: help manage test data setup when you're using mongoose and make the test data easy to access in your tests.

To do that, it only has two methods:
1. create
2. clean_up

## Tested With Mocha
I've only used it with Mocha, and the functions are setup to take a callback when they are finished like the before and after functions in mocha are used.  However I doubt this would not work for other testing frameworks as well.

## Creating test data
The create method can create and any model you've defined.  After it saves the model, it makes it available as a field on the FixturePrep object.  You provide the create method with an array of objects the has three properties:
	1) model: the name of the Mongoose model you want to create
	2) name: the name of the field you want to access it with from the fixturePrep object
	3) val: the data you want saved

You also provide a callback to call when all models have been created.

### Creating a single object
```js
var FixturePrep = require("mongoose-fixture-prep");
var fixtures = new FixturePrep();

describe("creating single fixture",function(){
	before(function(done){
		fixtures.create(
			[
				{name:'user1',model: 'User', val:{firstName:'John',lastName:'Smith'}}
			], done);
	});
	after(function(done){fixtures.clean_up(done)});

	it("should be able to access the object you saved", function(){
		//user1 is attached to the
		fixtures.should.have.property('user1');
		//it's has been saved and now has the _id field
		fixtures.user1.should.have.property('_id');
	});
});
```
### Creating multiple models
You pass into the create function an array of data to create so that you can create multiple objects.  the function handles all of the asynchrounous stuff so that your tests stay clean and readable

```js
var FixturePrep = require("mongoose-fixture-prep");
var fixtures = new FixturePrep();

describe("creating a multiple fixtures", function(){
	before(function(done){
		fixtures.create([{name:'user1',model: 'User', val:{firstName:'John',lastName:'Smith'}},
										 {name:'admin',model: 'User', val:{firstName:'super',lastName:'user', roles:['admin']}}
										], done)				
	})
	
	it("should be able to access the object you saved", function(){
		//user1 is attached to the
		fixtures.should.have.property('user1');
		fixtures.should.have.property('admin');
		
		fixtures.admin.should.have.property('_id');
	});
});
```
### Create an array of data
If your testing something that requires an array of data, you can pass in an array for the val parameter, and they will all be saved and all be accessible by the field name you provided

```js
var FixturePrep = require("mongoose-fixture-prep");
var fixtures = new FixturePrep();

describe("creating an array of data", function(){
	before(function(done){
		fixtures.create([{name:'users',model: 'User', val:[{firstName:'John',lastName:'Smith'},{firstName:'Jane',lastName:'Doe'}]},
										 {name:'admin',model: 'User', val:{firstName:'super',lastName:'user', roles:['admin']}}
										], done)				
	});
	
	it("should be able to access the object you saved", function(){
		//user1 is attached to the
		fixtures.users.length.should.eql(2);
		fixtures.should.have.property('admin');
	});
});
```

### Creating Related Data
If your object model has related data, it's get's pretty tricky setting up all of the objects and getting their references right. The way this module handles that is to let you define a function that creates the val object to be saved.  The parameter to the function is the TestPrep object with references to objects that have already been created.

As an example of how you can define related data, this is how you could model an order with products, where an order has line items with products.

```js
var FixturePrep = require("mongoose-fixture-prep");
var fixtures = new FixturePrep();

describe("related data", function(){
	before(function(done){
		user_with_company = function(fixtures){
			return {firstName:'John',lastName:'Smith', company: fixtures.testCompany}
		};
		fixtures.create(
			[
				{name:'testCompany',model:'Company',val:{name:'my company'}},
				{name:'user1',model: 'User', val:user_with_company}

			], done)				
	})
	
	it("should have the saved product in the line items", function(){
	
		fixtures.user1.should.have.property('company');
		fixtures.user1.company.should.eql(fixtures.testCompany._id);
	});
})
```js
### Use with AutoTestjs
I've tested this module on real world applications in conjuction with [AutoFixture.js](href="https://github.com/jcteague/autofixturejs") to create the test data for me.  In the spirit of small modules working together, they have been separated.  To use them together is very simple:

```
var FixturePrep = require("mongoose-fixture-prep");
var factory = require('AutoFixture')
var fixtures = new FixturePrep();

describe('using with autofixture',function(){
	before(function(done){
		factory.define('User',['firstName','lastName'])
		fixtures.create([
			{name:'user1',model:'User',val:factory.create('User')}
		],done);
	});

	it("should create the fixtures from the factory",function(){
		fixtures.should.have.property('user1');
		//it's has been saved and now has the _id field
		fixtures.user1.should.have.property('_id');
	})
})
```

