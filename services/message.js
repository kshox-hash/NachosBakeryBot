/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

module.exports = class Message {
  constructor(rawMessage) {
    this.rawMessage = rawMessage;
    this.id = rawMessage?.id;
    this.senderPhoneNumber = rawMessage?.from;

    if (rawMessage?.type === "text") {
      this.type = "text";
      this.text = rawMessage?.text?.body || "";
      return;
    }

    if (rawMessage?.type === "button") {
      this.type = rawMessage?.button?.text || "";
      this.text = rawMessage?.button?.text || "";
      this.payload = rawMessage?.button?.payload || "";
      return;
    }

    if (rawMessage?.type === "interactive") {
      const buttonReply = rawMessage?.interactive?.button_reply;

      if (buttonReply) {
        this.type = buttonReply.id || buttonReply.title || "interactive_button";
        this.text = buttonReply.title || buttonReply.id || "";
        this.payload = buttonReply.id || "";
        return;
      }
    }

    this.type = rawMessage?.type || "unknown";
    this.text = "";
    this.payload = "";
  }
};