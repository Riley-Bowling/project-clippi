import { init, RematchRootState } from "@rematch/core";
import createRematchPersist, { getPersistor } from "@rematch/persist";

import * as models from "./models";

import { updateEventActionManager } from "@/containers/actions";
import { dolphinRecorder } from "@/lib/dolphin";
import { obsConnection } from "@/lib/obs";
import { mapConfigurationToFilterSettings } from "@/lib/profile";
import { comboFilter } from "@/lib/realtime";
import { soundPlayer } from "@/lib/sounds";
import { transformer } from "./transformer";

const persistPlugin = createRematchPersist({
    version: 1,
    blacklist: ["tempContainer"],
    transforms: [transformer],
});

export const store = init({
    models,
    plugins: [persistPlugin],
});

export const dispatcher = store.dispatch;

export const persistor = getPersistor();
export type Store = typeof store;
export type Dispatch = typeof store.dispatch;
export type iRootState = RematchRootState<typeof models>;

export const Models = models;

const storeSync = () => {
    const state = store.getState();

    // Restore events
    const events = state.slippi.events;
    updateEventActionManager(events);

    // Restore sound files
    const soundFiles = state.filesystem.soundFiles;
    soundPlayer.sounds = soundFiles;

    // Restore combo settings
    const slippiSettings = state.slippi.comboProfiles[state.slippi.currentProfile];
    const converted = mapConfigurationToFilterSettings(JSON.parse(slippiSettings));
    if (slippiSettings) {
        comboFilter.updateSettings(converted);
    }
};

store.subscribe(() => {
    storeSync();
});

obsConnection.connectionStatus$.subscribe(status => {
    dispatcher.tempContainer.setOBSConnectionStatus(status);
});
obsConnection.recordingStatus$.subscribe(status => {
    dispatcher.tempContainer.setOBSRecordingStatus(status);
});
obsConnection.scenes$.subscribe(scenes => {
    dispatcher.tempContainer.setOBSScenes(scenes);
});
dolphinRecorder.currentBasename$.subscribe(name => {
    dispatcher.tempContainer.setDolphinPlaybackFile(name);
});
