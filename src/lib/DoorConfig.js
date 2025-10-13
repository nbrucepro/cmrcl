export const designOptions = {
      malaysian: {
        Clifton: ["45", "42", "40", "36", "34", "30", "27"],
        Bristol: ["45", "42", "40", "36", "34", "30", "27"],
        "7 panel": ["42", "40", "36", "34", "30", "27"],
        "6 panel": ["42", "40", "36", "34", "30", "27"],
        "4 panel": ["42", "40", "36", "34", "30", "27"],
        "3 panel": ["42", "40", "36", "34", "30", "27"],
        "2 panel horizon": ["42", "40", "36", "34", "30", "27"],
        "2 panel top": ["42", "40", "36", "34", "30", "27"],
        "1 panel": ["42", "40", "36", "34", "30", "27"],
        Harmony: ["42", "40", "36", "34", "30", "27"],
        Flat: ["45", "42", "40", "36", "34", "30", "27"],
      },
      melamine: {
        "Clifton Tiger": ["45", "42", "39", "36", "33", "30", "27"],
        "7 panel Flower": ["45", "42", "39", "36", "33", "30", "27"],
        "6 panel Red": ["45", "42", "39", "36", "33", "30", "27"],
        "Milano Black": ["45", "42", "39", "36", "33", "30", "27"],
      },
      zrk: {
        Clifton: ["45", "42", "39", "36", "33", "30", "27"],
        Bristol: ["45", "42", "39", "36", "33", "30", "27"],
        "3 Panel": ["45", "42", "39", "36", "33", "30", "27"],
      },
    };
export const mattressOptions = ["Single", "Double", "Spring"];
export const mattressHeights = ["4 inch", "5 inch", "6 inch", "8 inch"];

// lib/DoorConfig.js
export const categoryAttributes = {
  // Door
  "c25b2efb-ec58-4036-a38e-65e9c2c5bcfc": [
    { name: "Width", value: "" },
    { name: "Length", value: "" },
    { name: "Thickness", value: "" },
    { name: "FrameType", value: "" },
  ],

  // Lock
  "b52d030f-1309-4099-bc85-b3d040fb9806": [
    { name: "Lock code", value: "" },
  ],

  // Mattress
  "4f6e9c17-2a92-4694-a689-ab2fdeb887c6": [
    { name: "Size", value: "" },
    { name: "Height", value: "" },
  ],

  // Malaysian Door
  malaysian: [
    { name: "Size", value: "" },
  ],

  // Melamine
  melamine: [
    { name: "Size", value: "" },
  ],

  // ZRK
  zrk: [
    { name: "Size", value: "" },
  ],
};

export const categoryIdMap = {
  melamine: "2c81c619-b2b8-46ff-b4fb-aa729c54a491",
  zrk: "aa7970bf-1fab-4f4a-9679-29e612391ddf",
  malaysian: "df248c6e-71b6-48bc-b3b5-c50f10ab39ca",
   mattress     :"4f6e9c17-2a92-4694-a689-ab2fdeb887c6",
  lock:"b52d030f-1309-4099-bc85-b3d040fb9806",
   door  :"c25b2efb-ec58-4036-a38e-65e9c2c5bcfc"
};
export const reverseCategoryMap = Object.fromEntries(
  Object.entries(categoryIdMap).map(([key, value]) => [value, key])
);

    