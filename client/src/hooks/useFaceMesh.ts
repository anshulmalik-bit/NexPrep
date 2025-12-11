import { useEffect, useRef, useCallback } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import type { Results } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { useInterviewStore } from '../store/interview-store';

interface UseFaceMeshOptions {
    videoElement: HTMLVideoElement | null;
    enabled: boolean;
}

/**
 * useFaceMesh Hook
 * Initializes MediaPipe FaceMesh on a video element and updates live metrics.
 */
export const useFaceMesh = ({ videoElement, enabled }: UseFaceMeshOptions) => {
    const faceMeshRef = useRef<FaceMesh | null>(null);
    const cameraRef = useRef<Camera | null>(null);
    const { updateGaze, updatePosture, updateConfidence } = useInterviewStore();

    // Process FaceMesh results
    const onResults = useCallback((results: Results) => {
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            // No face detected
            updateGaze('off');
            updatePosture('unknown');
            return;
        }

        const landmarks = results.multiFaceLandmarks[0];

        // --- GAZE DETECTION ---
        // Use nose tip (landmark 1) and forehead center (landmark 10)
        // to estimate head rotation (yaw)
        const noseTip = landmarks[1];
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];

        // Simple check: If nose is roughly centered between eyes, looking at screen
        const eyeMidX = (leftEye.x + rightEye.x) / 2;
        const noseOffsetX = Math.abs(noseTip.x - eyeMidX);

        // Threshold: if offset is > 0.05 (5% of normalized coordinates), looking away
        if (noseOffsetX < 0.06 && noseTip.z < 0) {
            updateGaze('on');
        } else {
            updateGaze('off');
        }

        // --- POSTURE DETECTION ---
        // Use face bounding box size and vertical position
        // A well-framed face should be centered and of reasonable size
        const faceTop = Math.min(...landmarks.map(l => l.y));
        const faceBottom = Math.max(...landmarks.map(l => l.y));
        const faceHeight = faceBottom - faceTop;

        // Good posture: face takes up 30-60% of vertical frame, centered
        const faceCenterY = (faceTop + faceBottom) / 2;
        const isWellPositioned = faceCenterY > 0.3 && faceCenterY < 0.7;
        const isGoodSize = faceHeight > 0.25 && faceHeight < 0.65;

        if (isWellPositioned && isGoodSize) {
            updatePosture('good');
        } else {
            updatePosture('poor');
        }

        // --- CONFIDENCE BOOST ---
        // Slight confidence increase when face is detected and engaged
        updateConfidence(Math.min(100, 60 + (faceHeight * 40)));

    }, [updateGaze, updatePosture, updateConfidence]);

    // Initialize FaceMesh
    useEffect(() => {
        if (!enabled || !videoElement) return;

        const faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        faceMesh.onResults(onResults);
        faceMeshRef.current = faceMesh;

        // Create Camera instance
        const camera = new Camera(videoElement, {
            onFrame: async () => {
                if (faceMeshRef.current && videoElement.readyState >= 2) {
                    await faceMeshRef.current.send({ image: videoElement });
                }
            },
            width: 640,
            height: 480
        });

        camera.start();
        cameraRef.current = camera;

        return () => {
            camera.stop();
            faceMesh.close();
            faceMeshRef.current = null;
            cameraRef.current = null;
        };
    }, [enabled, videoElement, onResults]);

    return {
        isInitialized: !!faceMeshRef.current
    };
};

export default useFaceMesh;
