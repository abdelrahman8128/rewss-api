import { Application } from "express";

export default (app: Application) => {
     app.use("/api/v1/auth", require("./modules/authenticaion/auth.route").default);
     app.use("/api/v1/otp", require("./modules/otp/otp.route").default);
     app.use("/api/v1/brand", require("./modules/brand/brand.route").default);
     app.use("/api/v1/model", require("./modules/model/model.route").default);
     app.use("/api/v1/category", require("./modules/category/category.route").default);
     app.use("/api/v1/ad", require("./modules/Ad/ad.route").default);


}
