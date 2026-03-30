/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

const { FacebookAdsApi } = require("facebook-nodejs-business-sdk");
const config = require("./config");

const api = new FacebookAdsApi(config.accessToken);

module.exports = class GraphApi {
  static async #makeApiCall(messageId, senderPhoneNumberId, requestBody) {
    try {
      if (messageId) {
        const typingBody = {
          messaging_product: "whatsapp",
          status: "read",
          message_id: messageId,
          typing_indicator: {
            type: "text",
          },
        };

        await api.call(
          "POST",
          [`${senderPhoneNumberId}`, "messages"],
          typingBody
        );
      }

      console.log("Request body =>");
      console.log(JSON.stringify(requestBody, null, 2));

      const response = await api.call(
        "POST",
        [`${senderPhoneNumberId}`, "messages"],
        requestBody
      );

      console.log("API call successful:");
      console.log(JSON.stringify(response, null, 2));

      return response;
    } catch (error) {
      console.error("Error making API call:");
      console.error(JSON.stringify(error?.response?.data || error, null, 2));
      throw error;
    }
  }

  static async messageWithInteractiveReply(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber,
    messageText,
    replyCTAs
  ) {
    const requestBody = {
      messaging_product: "whatsapp",
      to: recipientPhoneNumber,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: messageText,
        },
        action: {
          buttons: replyCTAs.map((cta) => ({
            type: "reply",
            reply: {
              id: cta.id,
              title: cta.title,
            },
          })),
        },
      },
    };

    return this.#makeApiCall(messageId, senderPhoneNumberId, requestBody);
  }

  static async messageWithUtilityTemplate(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber,
    options
  ) {
    const {
      templateName,
      locale,
      imageLink,
      bodyParameters = [],
    } = options;

    const components = [];

    if (imageLink) {
      components.push({
        type: "header",
        parameters: [
          {
            type: "image",
            image: {
              link: imageLink,
            },
          },
        ],
      });
    }

    if (bodyParameters.length > 0) {
      components.push({
        type: "body",
        parameters: bodyParameters.map((value) => ({
          type: "text",
          text: value,
        })),
      });
    }

    const requestBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhoneNumber,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: locale,
        },
        ...(components.length > 0 ? { components } : {}),
      },
    };

    return this.#makeApiCall(messageId, senderPhoneNumberId, requestBody);
  }

  static async messageWithLimitedTimeOfferTemplate(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber,
    options
  ) {
    const { templateName, locale, imageLink, offerCode } = options;

    const currentTime = new Date();
    const futureTime = new Date(currentTime.getTime() + 48 * 60 * 60 * 1000);

    const requestBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhoneNumber,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: locale,
        },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "image",
                image: {
                  link: imageLink,
                },
              },
            ],
          },
          {
            type: "limited_time_offer",
            parameters: [
              {
                type: "limited_time_offer",
                limited_time_offer: {
                  expiration_time_ms: futureTime.getTime(),
                },
              },
            ],
          },
          {
            type: "button",
            sub_type: "copy_code",
            index: 0,
            parameters: [
              {
                type: "coupon_code",
                coupon_code: offerCode,
              },
            ],
          },
        ],
      },
    };

    return this.#makeApiCall(messageId, senderPhoneNumberId, requestBody);
  }

  static async messageWithMediaCardCarousel(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber,
    options
  ) {
    const { templateName, locale, cards } = options;

    const requestBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhoneNumber,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: locale,
        },
        components: [
          {
            type: "carousel",
            cards: cards.map((card, idx) => {
              const cardComponents = [
                {
                  type: "header",
                  parameters: [
                    {
                      type: "image",
                      image: {
                        link: card.imageLink,
                      },
                    },
                  ],
                },
              ];

              if (card.bodyParameters?.length) {
                cardComponents.push({
                  type: "body",
                  parameters: card.bodyParameters.map((value) => ({
                    type: "text",
                    text: value,
                  })),
                });
              }

              if (card.urlSuffix) {
                cardComponents.push({
                  type: "button",
                  sub_type: "url",
                  index: 0,
                  parameters: [
                    {
                      type: "text",
                      text: card.urlSuffix,
                    },
                  ],
                });
              }

              return {
                card_index: idx,
                components: cardComponents,
              };
            }),
          },
        ],
      },
    };

    return this.#makeApiCall(messageId, senderPhoneNumberId, requestBody);
  }

  static async messageWithImageAndButtons(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber,
    imageLink,
    bodyText,
    footerText,
    buttons
  ) {
    const requestBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhoneNumber,
      type: "interactive",
      interactive: {
        type: "button",
        header: {
          type: "image",
          image: {
            link: imageLink,
          },
        },
        body: {
          text: bodyText,
        },
        footer: {
          text: footerText,
        },
        action: {
          buttons: buttons.map((button) => ({
            type: "reply",
            reply: {
              id: button.id,
              title: button.title,
            },
          })),
        },
      },
    };

    return this.#makeApiCall(messageId, senderPhoneNumberId, requestBody);
  }

  static async sendCarouselTemplate(
    messageId,
    senderPhoneNumberId,
    recipientPhoneNumber
  ) {
    return this.messageWithMediaCardCarousel(
      messageId,
      senderPhoneNumberId,
      recipientPhoneNumber,
      {
        templateName: "automatiza_carousel",
        locale: "es",
        cards: [
          {
            imageLink:
              "https://pub-9df4bc34eee249debc0d04d6df729879.r2.dev/avatar.png",
          },
          {
            imageLink:
              "https://pub-9df4bc34eee249debc0d04d6df729879.r2.dev/avatar.png",
          },
          {
            imageLink:
              "https://pub-9df4bc34eee249debc0d04d6df729879.r2.dev/avatar.png",
          },
        ],
      }
    );
  }
};