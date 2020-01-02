import * as React from "react";

import { ActionEvent } from "@/lib/realtime";
import { Action as ActionDefinition } from "@vinceau/event-actions";
import { AddEventDropdown, EventActions } from "./EventActions";

import { Dispatch, iRootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";

export interface EventActionConfig {
    event: ActionEvent;
    actions: ActionDefinition[];
}

export const Automator: React.FC = () => {
    const val = useSelector((state: iRootState) => state.slippi.events);
    const dispatch = useDispatch<Dispatch>();
    const disabledEvents = val.map(e => e.event);
    const addEvent = (event: ActionEvent) => {
        dispatch.slippi.addNewEventAction(event);
    };
    return (
        <div>
            { val.map((e, i) => {
                const onChange = (newVal: EventActionConfig) => {
                    dispatch.slippi.updateActionEvent({
                        index: i,
                        event: newVal,
                    });
                };
                const onRemove = () => {
                    dispatch.slippi.removeActionEvent(i);
                };
                return (
                    <EventActions
                        key={e.event}
                        disabledOptions={disabledEvents}
                        value={e}
                        onChange={onChange}
                        onRemove={onRemove}
                    />
                );
            })
            }
            <AddEventDropdown onChange={addEvent} disabledOptions={disabledEvents} />
        </div>
    );
};