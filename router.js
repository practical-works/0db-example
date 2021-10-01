//==============================================================================
// ■ Router (router.js)
//------------------------------------------------------------------------------
//     Router entry point.
//==============================================================================
const express = require("express");
const router = express.Router();
const YAML = require("json2yaml");

//------------------------------------------------------------------------------
// ► Exports
//------------------------------------------------------------------------------
module.exports = router;

//------------------------------------------------------------------------------
// ● Database
//------------------------------------------------------------------------------
const odb = require("0db");

//******************************************************************************
// 🔻 Routes
//******************************************************************************
router.use(express.static("./static"));
router.use(async (req, res, next) => {
  req.db = await odb();
  next();
});

//------------------------------------------------------------------------------
// ● READ
//------------------------------------------------------------------------------
router.get("(/read)?", async (req, res) => {
  // Get-Items
  const users = await req.db("users").read();

  // Get-Message
  let { message } = req.session;
  req.session.message = undefined;

  // Render
  res.render("./", { message, items: users });
});

//------------------------------------------------------------------------------
// ● CREATE
//------------------------------------------------------------------------------
router.get("/create", async (req, res, next) => {
  try {
    // Get-Data
    const { name } = req.query;
    if (!name) throw Error("Name is empty");

    // Create-Item
    const createdUser = await req.db("users").create({ name });

    // Set-Message and Redirect
    req.session.message = {
      title: "CREATED",
      content: YAML.stringify(createdUser),
    };
    res.redirect("/");
  } catch(err) {
    next(err);
  }
});

//------------------------------------------------------------------------------
// ● UPDATE
//------------------------------------------------------------------------------
router.get("/update/:id", async (req, res, next) => {
  try {
    // Get-Data
    const { id: $id } = req.params;
    const { name } = req.query;

    // Update-Item
    const updatedUsers = await req.db("users").update({ $id }, { name });

    // Set-Message and Redirect
    req.session.message = {
      title: "UPDATED",
      content: YAML.stringify(updatedUsers),
    };
    res.redirect("/");
  } catch(err) {
    next(err)
  }
});

//------------------------------------------------------------------------------
// ● DELETE
//------------------------------------------------------------------------------
router.get("/delete/:id", async (req, res, next) => {
  try {
    // Get-Data
    const { id: $id } = req.params;

    // Delete-Item
    const deletedUsers = await req.db("users").delete({ $id: req.params.id });

    // Set-Message and Redirect
    req.session.message = {
      title: "DELETED",
      content: YAML.stringify(deletedUsers),
    };
    res.redirect("/");
  } catch(err) {
    next(err);
  }
});

//------------------------------------------------------------------------------
// ● Error-Handler
//------------------------------------------------------------------------------
router.use((err, req, res, next) => {
  const { name, message } = err;
  req.session.message = {
    title: "Error",
    content: YAML.stringify({ name, message }),
  };
  res.redirect("/");
});