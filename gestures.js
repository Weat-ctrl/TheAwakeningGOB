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
