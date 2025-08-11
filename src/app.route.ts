import { Application } from "express";

export default (app: Application) => {
     app.use("/api/v1/auth", require("./modules/authenticaion/auth.route").default);
     app.use("/api/v1/otp", require("./modules/otp/otp.route").default);
     app.use("/api/v1/brand", require("./modules/brand/brand.route").default);

}
