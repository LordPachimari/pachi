/* eslint-disable @typescript-eslint/ban-types */
/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("./index.js").Auth;
  type DatabaseUserAttributes = {};
  type DatabaseSessionAttributes = {};
}
