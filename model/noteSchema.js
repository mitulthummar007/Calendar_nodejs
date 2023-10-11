import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
    date: String,
    title: String,
  },{timestamps : true});
  
export const Note = mongoose.model("Note", NoteSchema);                  