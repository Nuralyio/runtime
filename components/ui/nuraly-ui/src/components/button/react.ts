
import { createComponent } from "@lit-labs/react";
import * as React from 'react';
import { ElButtonElement } from "./el-button";
export const ElButton = createComponent({
    tagName: "el-button",
    elementClass: ElButtonElement,
    react: React,
    events: {
      countChanged: "count-changed",
    },
  });