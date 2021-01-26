export const getTrendingRate = (item, params) => {
    const {reactions = 0, comments = 0} = item;
    const {REACTIONS_TRENDING_WEIGHT, TRENDING_NORM} = params;

    return (reactions * REACTIONS_TRENDING_WEIGHT + comments) / TRENDING_NORM;
}

export const getMaxTrendingRate = (items, params) => {
    return Math.max(0, ...items.map((i) => getTrendingRate(i, params)));
}


const getNorm = (value, norm) => {
    return value >= norm
        ? 1
        : value <= 0
            ? 0
            : value / norm;
}

const getRevertedNorm = (value, norm) => {
    return value >= norm
        ? 0
        : value <= 0
            ? 1
            : 1 - value / norm;
}


export const getItemScores = (items, params) => {
    const {UPDATE_NORM, CREATE_NORM, UPDATE_WEIGHT, CREATION_WEIGHT, TRENDING_WEIGHT} = params;
    const maxTrendingRate = getMaxTrendingRate(items, params);

    let scores = items.map(item => {
        const {updatedAt, createdAt} = item;
        const result = {item};

        result.trendingRate = getTrendingRate(item, params);
        result.trendingScore = getNorm(result.trendingRate, maxTrendingRate)
        result.updateScore = getRevertedNorm(updatedAt, UPDATE_NORM);
        result.createScore = getRevertedNorm(createdAt, CREATE_NORM)
        result.totalScore =
            CREATION_WEIGHT * result.createScore +
            UPDATE_WEIGHT * result.updateScore +
            TRENDING_WEIGHT * result.trendingScore;

        return result;
    })

    const trendingGroups = [...new Set(scores.map(({trendingRate}) => trendingRate))].sort((a,b) => a - b);
    const numberOfGroups = trendingGroups.length;

    scores = scores.map((result) => {
        result.trendingOrderScore = (trendingGroups.indexOf(result.trendingRate) + 1) / numberOfGroups
        result.totalOrderScore =
            CREATION_WEIGHT * result.createScore +
            UPDATE_WEIGHT * result.updateScore +
            TRENDING_WEIGHT * result.trendingOrderScore;

        return result;
    })

    scores.maxTrendingRate = maxTrendingRate;

    return scores;
}

