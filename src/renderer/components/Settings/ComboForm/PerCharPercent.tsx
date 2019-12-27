import * as React from "react";

import { Character, getCharacterName } from "@vinceau/slp-realtime";
import { produce } from "immer";
import { Field } from "react-final-form";
import { FieldArray } from "react-final-form-arrays";

import { CharacterSelectAdapter } from "./CharacterSelect";

interface CharPercentOption {
    character: Character;
    percent: number;
}

export const mapCharacterPercentArrayToObject = (name: string, values: any): any => produce(values, (draft: any) => {
    const newValue = {};
    draft[name].forEach((c: CharPercentOption) => {
        newValue[c.character] = c.percent;
    });
    draft[name] = newValue;
});

export const mapObjectToCharacterPercentArray = (name: string, values: any): any => produce(values, (draft: any) => {
    const charPercents = draft[name];
    const percentArray: CharPercentOption[] = [];
    for (const [key, value] of Object.entries(charPercents)) {
        percentArray.push({
            character: parseInt(key, 10),
            percent: value as number,
        });
    }
    percentArray.sort((a, b) => {
        const aName = getCharacterName(a.character);
        const bName = getCharacterName(b.character);
        if (aName < bName) { return -1; }
        if (aName > bName) { return 1; }
        return 0;
      });
    draft[name] = percentArray;
});

export const PerCharPercent: React.FC<{ name: string; values: any; push: any; pop: any }> = props => {
    const { name, values, push } = props;
    const selectedChars: CharPercentOption[] = values[name] || [];
    const selectedCharIDs = selectedChars.filter(c => Boolean(c)).map(c => c.character);
    return (
        <div style={{display: "flex", flexDirection: "column", width: "100%"}}>
            <FieldArray name={name}>
                {({ fields }) => {
                    return fields.map((n, index) => {
                        return (
                        <div key={n} style={{display: "flex", flexDirection: "row"}}>
                            <CharacterSelectAdapter
                                name={`${n}.character`}
                                disabledOptions={selectedCharIDs}
                            />
                            <Field name={`${n}.percent`} component="input" type="number" parse={(v: string) => parseInt(v, 10)} />
                            <span
                                onClick={() => fields.remove(index)}
                                style={{ cursor: "pointer" }}
                            >
                                ❌
                            </span>
                        </div>
                    );
                        });
                }
                }
            </FieldArray>
            <div className="buttons">
                <button type="button" onClick={() => push(name, undefined)}>
                    Add Character
                </button>
            </div>
        </div>
    );
};