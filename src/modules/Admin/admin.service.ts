import bcrypt from "bcryptjs";
import User from "../../Schema/User/user.schema";

export default class AdminService {
  async createSeller(req: any) {
    const { email, phoneNumber, password, name } = req.body || {};

    if (!email && !phoneNumber) {
      throw new Error("Email or phone number is required");
    }

    if (email) {
      const existsEmail = await User.findOne({ email });
      if (existsEmail) {
        throw new Error("This email already exists");
      }
    }

    if (phoneNumber) {
      const existsPhone = await User.findOne({ phoneNumber });
      if (existsPhone) {
        throw new Error("This phone number already exists");
      }
    }

    const plainPassword = password || this.generateRandomPassword(12);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Generate unique username based on name/email/phone
    const now = new Date();
    let timestamp = `${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`;
    const base = String(name || email || phoneNumber || "seller")
      .toLowerCase()
      .replace(/\s+/g, "");
    let username = `${base}${timestamp}`;
    let usernameExists = await User.findOne({ username });
    while (usernameExists) {
      timestamp = `${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}${Math.floor(
        Math.random() * 100
      )}`;
      username = `${base}${timestamp}`;
      usernameExists = await User.findOne({ username });
    }

    const newSeller = await User.create({
      username,
      name: name || base,
      email,
      phoneNumber: phoneNumber || undefined,
      password: hashedPassword,
      role: "seller",
      status: "active",
      isEmailVerified: !!email,
      isPhoneVerified: !!phoneNumber,
    });

    return { newSeller, plainPassword };
  }

  private generateRandomPassword(length = 12): string {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const digits = "23456789";
    const symbols = "!@#$%^&*-_+=?";
    const all = upper + lower + digits + symbols;

    const picks = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      digits[Math.floor(Math.random() * digits.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    for (let i = picks.length; i < length; i++) {
      picks.push(all[Math.floor(Math.random() * all.length)]);
    }

    // shuffle
    for (let i = picks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [picks[i], picks[j]] = [picks[j], picks[i]];
    }
    return picks.join("");
  }
}
