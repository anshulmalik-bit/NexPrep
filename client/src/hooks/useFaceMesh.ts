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
    const { updateFaceAnalysis } = useInterviewStore();

    // Process FaceMesh results
    const onResults = useCallback((results: Results) => {
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            updateFaceAnalysis({ gaze: 'off', posture: 'unknown' });
            return;
        }

        const landmarks = results.multiFaceLandmarks[0];

        // --- GAZE DETECTION ---
        const noseTip = landmarks[1];
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];

        const eyeMidX = (leftEye.x + rightEye.x) / 2;
        const noseOffsetX = Math.abs(noseTip.x - eyeMidX);
        const eyeMidY = (leftEye.y + rightEye.y) / 2;
        const noseOffsetY = noseTip.y - eyeMidY;

        // Thresholds
        const isLookingCenter = noseOffsetX < 0.12;
        const isLookingForward = noseOffsetY > 0.01 && noseOffsetY < 0.25;
        const gazeStatus = (isLookingCenter && isLookingForward) ? 'on' : 'off';

        // --- POSTURE DETECTION ---
        const faceTop = Math.min(...landmarks.map(l => l.y));
        const faceBottom = Math.max(...landmarks.map(l => l.y));
        const faceHeight = faceBottom - faceTop;
        const faceCenterY = (faceTop + faceBottom) / 2;

        const isWellPositioned = faceCenterY > 0.3 && faceCenterY < 0.7;
        const isGoodSize = faceHeight > 0.25 && faceHeight < 0.65;
        const postureStatus = (isWellPositioned && isGoodSize) ? 'good' : 'poor';

        // --- CONFIDENCE ---
        const confidenceScore = Math.min(100, 60 + (faceHeight * 40));

        // Atomic Update
        updateFaceAnalysis({
            gaze: gazeStatus,
            posture: postureStatus,
            confidence: confidenceScore
        });

    }, [updateFaceAnalysis]);

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
            width: 1280,
            height: 720
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
