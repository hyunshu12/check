export function upsertMovement(map, hakbun, record) {
    const clone = { ...map };
    if (!record || !record.location) {
        delete clone[hakbun];
        return clone;
    }
    clone[hakbun] = record;
    return clone;
}
