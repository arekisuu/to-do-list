// Require the NPM modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// Set up the modules
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-alex:admin-alex@cluster0.4rdub.mongodb.net/todolistDB", {useNewUrlParser: true});

// Create a schema for new items
const itemSchema = ({
  name: String
});

// Create an item model based on the schema
const Item = mongoose.model("Item", itemSchema);

// Create the default/placeholder items using the model
const item1 = new Item({
  name: "Welcome to your To-Do List!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

// Group them together in an array
const defaultItems = [item1, item2, item3];

// Create a schema for new lists
const listSchema = {
  name: String,
  items: [itemSchema]
};

// Create a list model based on the schema
const List = mongoose.model("List", listSchema);

// Handle get request on home route
app.get("/", (req, res) => {
  Item.find({}, (err, foundItems) => {
    // Check to see if the list is empty
    if (foundItems.length === 0) {
      // Add the default/placeholder items if so
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        }
      });
      res.redirect("/");
    } else {
      // Render the list as it is, otherwise
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

// Handle get requests on custom routes
app.get("/:customListName", (req, res) => {
  // Use lodash to capitalize inserted list name
  const customListName = _.capitalize(req.params.customListName);
  // Search for the requested custom list
  List.findOne({
    name: customListName
  }, (err, foundList) => {
    if (err) {
      console.log(err);
    } else {
      if (!foundList) {
        // Create a new custom list with default items if none is found
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // Display the custom list if it already exists
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

// Handle post requests on home route for adding new items
app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name: itemName
  });
  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, (err, foundList) => {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

// Handle post requests for item deletions
app.post("/delete", (req, res) => {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID, (err) => {
      console.log(err)
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, (err, foundList) => {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

// Listen on randomly assigned cloud port AND local port 3000
app.listen(process.env.PORT || 3000, () => {console.log("Server started on port 3000")});

// Redirect to room
function redr(key){
  alert("Oi");
}