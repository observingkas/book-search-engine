import mongoose from "mongoose";

mongoose.connect(
  process.env.MONGODB_URI ||
    "mongodb+srv://peasleykassandra:LavenderDr34ms1~@cluster0.izytn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);

export default mongoose.connection;
