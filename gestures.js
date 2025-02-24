// gestures.js

function isThumbsUp(landmarks) {
  const thumbTip = landmarks[4];
  const indexFingerTip = landmarks[8];
  const middleFingerTip = landmarks[12];
  const ringFingerTip = landmarks[16];
  const pinkyTip = landmarks[20];

  return thumbTip.y < indexFingerTip.y &&
         thumbTip.y < middleFingerTip.y &&
         thumbTip.y < ringFingerTip.y &&
         thumbTip.y < pinkyTip.y;
}

function isPeaceSign(landmarks) {
  const indexFingerTip = landmarks[8];
  const middleFingerTip = landmarks[12];
  const ringFingerTip = landmarks[16];
  const pinkyTip = landmarks[20];

  return indexFingerTip.y < ringFingerTip.y &&
         middleFingerTip.y < ringFingerTip.y &&
         middleFingerTip.y < pinkyTip.y &&
         indexFingerTip.y < pinkyTip.y;
}

function isFist(landmarks) {
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexFingerTip = landmarks[8];
  const middleFingerTip = landmarks[12];
  const ringFingerTip = landmarks[16];
  const pinkyTip = landmarks[20];

  return Math.abs(thumbTip.x - wrist.x) < 0.1 &&
         Math.abs(indexFingerTip.x - wrist.x) < 0.1 &&
         Math.abs(middleFingerTip.x - wrist.x) < 0.1 &&
         Math.abs(ringFingerTip.x - wrist.x) < 0.1 &&
         Math.abs(pinkyTip.x - wrist.x) < 0.1 &&
         Math.abs(thumbTip.y - wrist.y) < 0.1 &&
         Math.abs(indexFingerTip.y - wrist.y) < 0.1 &&
         Math.abs(middleFingerTip.y - wrist.y) < 0.1 &&
         Math.abs(ringFingerTip.y - wrist.y) < 0.1 &&
         Math.abs(pinkyTip.y - wrist.y) < 0.1;
}

function isOpenPalm(landmarks) {
  const thumbTip = landmarks[4];
  const indexFingerTip = landmarks[8];
  const middleFingerTip = landmarks[12];
  const ringFingerTip = landmarks[16];
  const pinkyTip = landmarks[20];

  return indexFingerTip.y < landmarks[7].y &&
         middleFingerTip.y < landmarks[11].y &&
         ringFingerTip.y < landmarks[15].y &&
         pinkyTip.y < landmarks[19].y &&
         Math.abs(thumbTip.x - indexFingerTip.x) > 0.1 &&
         Math.abs(indexFingerTip.x - middleFingerTip.x) > 0.1 &&
         Math.abs(middleFingerTip.x - ringFingerTip.x) > 0.1 &&
         Math.abs(ringFingerTip.x - pinkyTip.x) > 0.1;
}

function isOkSign(landmarks) {
  const thumbTip = landmarks[4];
  const indexFingerTip = landmarks[8];
  const middleFingerTip = landmarks[12];
  const ringFingerTip = landmarks[16];
  const pinkyTip = landmarks[20];

  return Math.abs(thumbTip.x - indexFingerTip.x) < 0.1 &&
         Math.abs(thumbTip.y - indexFingerTip.y) < 0.1 &&
         middleFingerTip.y < landmarks[11].y &&
         ringFingerTip.y < landmarks[15].y &&
         pinkyTip.y < landmarks[19].y;
  }
