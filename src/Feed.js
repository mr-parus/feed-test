import React from 'react';

function makeId(length = 10) {
    var result = "";
    var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export class Feed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            UPDATE_WEIGHT: 1,
            CREATION_WEIGHT: 1,
            TRENDING_WEIGHT: 1,
            CREATE_NORM: 15,
            UPDATE_NORM: 15,
            TRENDING_NORM: 1000,
            REACTIONS_TRENDING_WEIGHT: 1 / 5,
            items: {},
        };
    }

    createItem() {
        const createdAt =  2 + Math.floor(Math.random() * this.state.CREATE_NORM);

        return {
            id: makeId(),
            reactions: Math.floor(Math.random() * this.state.CREATE_NORM),
            comments: Math.floor(Math.random() * this.state.CREATE_NORM),
            createdAt,
            updatedAt: Math.floor(Math.random() * createdAt),
            color: "#" + Math.floor(Math.random()*16777215).toString(16),
        };
    }

    createItems() {
        const items = {};

        for (let i = 1; i < 15; i++) {
            const item = this.createItem();
            items[item.id] = item;
        }

        const newItem = {
            id: "New",
            reactions: 0,
            comments: 0,
            createdAt: 0,
            updatedAt: 0,
            name: "new item",
        }
        items[newItem.id] = newItem;

        const oldAndTrending = {
            id: "Trending",
            reactions: Math.max(...Object.values(items).map((a) => a.reactions)) + 5,
            comments: Math.max(...Object.values(items).map((a) => a.comments)) + 5,
            createdAt: this.state.CREATE_NORM,
            updatedAt: this.state.UPDATE_NORM,
            name: "Old + trending",
        }
        items[oldAndTrending.id] = oldAndTrending;

        this.setState({ items, selected: newItem.id});
    }

    componentDidMount() {
        this.createItems()
    }

    getTrendingRate(item) {
        const { reactions = 0, comments = 0 } = item;
        const { TRENDING_NORM, REACTIONS_TRENDING_WEIGHT } = this.state;

        return (reactions * REACTIONS_TRENDING_WEIGHT + comments) / TRENDING_NORM;
    }

    updateItem(itemId, update) {
        this.setState({
            items: {
                ...this.state.items,
                [itemId]: {
                    ...this.state.items[itemId],
                    ...update,
                },
            },
        });
    }

    updateParam(name, value) {
        this.setState({
            ...this.state,
            [name]: value,
        });
    }

    score(item, maxTrendingRate) {
        const trendingRate = this.getTrendingRate(item);
        const result = { item };

        result.trendingScore =
            trendingRate >= maxTrendingRate
                ? 1
                : trendingRate <= 0
                ? 0
                : trendingRate / maxTrendingRate;

        const { UPDATE_NORM } = this.state;
        const { updatedAt } = item;
        result.updateScore =
            updatedAt >= UPDATE_NORM
                ? 0
                : updatedAt <= 0
                ? 1
                : 1 - updatedAt / UPDATE_NORM;

        const { CREATE_NORM } = this.state;
        const { createdAt } = item;
        result.createScore =
            createdAt >= CREATE_NORM
                ? 0
                : createdAt <= 0
                ? 1
                : 1 - createdAt / CREATE_NORM;

        const { UPDATE_WEIGHT, CREATION_WEIGHT, TRENDING_WEIGHT } = this.state;

        result.totalScore =
            CREATION_WEIGHT * result.createScore +
            UPDATE_WEIGHT * result.updateScore +
            result.trendingScore * TRENDING_WEIGHT;

        result.trendingRate = trendingRate;

        return result;
    }

    renderItems(itemScores, disabled = false) {
        return (
            <div>
                {itemScores.map(
                    (
                        { item, totalScore, trendingScore, updateScore, createScore, trendingRate },
                        i
                    ) => (
                        <li key={i} className={item.id === this.state.selected ? "selected" : ""}>
                            <h2>
                                {item.name && <span className="name">[{item.name}]</span>}
                                TotalScore: {totalScore.toFixed(6)}
                            </h2>
                            <h3>Trending Score {trendingScore}</h3>
                            <h3>Update Score {updateScore}</h3>
                            <h3>Publish Score {createScore}</h3>
                            <h3>Trending rate {trendingRate}</h3>

                            {item.id !== this.state.selected
                                ? (      <button className='selectButton'
                                                 onClick={() => {
                                                     this.setState({selected: item.id})
                                                 }}
                                >Select</button>)
                                : null
                            }

                            <hr/>

                            <b><i style={{color: item.color}}>{item.id}</i></b>

                            <div style={{display:'flex', justifyContent:'space-around'}}>
                                <div>
                                    <div>
                                        <small>Created</small>
                                        <input
                                            disabled={disabled}
                                            type="number"
                                            value={item.createdAt}
                                            min={0}
                                            onChange={(e) => {
                                                const newValue = parseInt(e.target.value);
                                                this.updateItem(item.id, {
                                                    createdAt: newValue,
                                                    updatedAt:
                                                        newValue < item.updatedAt ? newValue : item.updatedAt,
                                                });
                                            }}
                                        />
                                        <i>days ago</i>
                                    </div>

                                    <div>
                                        <small>Updated</small>
                                        <input
                                            disabled={disabled}
                                            type="number"
                                            value={item.updatedAt}
                                            min={0}
                                            max={item.createdAt}
                                            onChange={(e) => {
                                                this.updateItem(item.id, {
                                                    updatedAt: parseInt(e.target.value),
                                                });
                                            }}
                                        />
                                        <i>days ago</i>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <small>Comments</small>
                                        <input
                                            disabled={disabled}
                                            type="number"
                                            value={item.comments}
                                            min={0}
                                            onChange={(e) => {
                                                this.updateItem(item.id, {
                                                    comments: parseInt(e.target.value),
                                                });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <small>Reactions</small>
                                        <input
                                            disabled={disabled}
                                            type="number"
                                            value={item.reactions}
                                            min={0}
                                            onChange={(e) => {
                                                this.updateItem(item.id, {
                                                    reactions: parseInt(e.target.value),
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </li>
                    )
                )}
            </div>
        )
    }

    render() {
        const { CREATION_WEIGHT, UPDATE_WEIGHT, TRENDING_WEIGHT } = this.state;
        const items =  Object.values(this.state.items);
        const maxTrendingRate = Math.max(0, ...items.map((i) => this.getTrendingRate(i)));
        const itemScores = items.map((item) => this.score(item, maxTrendingRate))
            .sort(({totalScore: a}, {totalScore: b}) => b - a)


        return (
            <div>
                <h1>Params</h1>
                {Object.entries(this.state)
                    .filter(([key]) => !["items", 'selected', 'TRENDING_NORM'].includes(key))
                    .map(([key, value], i) => {
                        return (
                            <div key={i}>
                                {key}
                                <input
                                    type="number"
                                    value={value}
                                    min={0}
                                    onChange={(e) => {
                                        this.updateParam(key, parseFloat(e.target.value));
                                    }}
                                />
                            </div>
                        );
                    })}
                <small> Max trending rate: {maxTrendingRate.toFixed(3)} <br/></small>
                <small>
                    Total Score = <b>{UPDATE_WEIGHT}</b> * updateScore + <b>{CREATION_WEIGHT} </b>*
                    cteationScore + <b>{TRENDING_WEIGHT}</b> * trendingScore
                </small>
                <hr/>
                <button onClick={() => {this.createItems();}}>Regenerate</button>
                <hr />

                <div className='container'>
                    <div style={{position: "fixed", right: 100}}>
                        {this.state.selected
                            ?this.renderItems([ this.score(this.state.items[this.state.selected], maxTrendingRate)])
                            : <li>Select item to edit</li>}
                    </div>
                    {this.renderItems(itemScores, true)}
                </div>
            </div>
        );
    }
}
