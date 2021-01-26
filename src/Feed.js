import Plot from 'react-plotly.js';
import React from 'react';
import { createItem } from './utils/items';
import { getItemScores } from './utils/scoring';


export class Feed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            UPDATE_WEIGHT: 1,
            CREATION_WEIGHT: 1,
            TRENDING_WEIGHT: 1,
            CREATE_NORM: 15,
            UPDATE_NORM: 5,
            TRENDING_NORM: 1000,
            REACTIONS_TRENDING_WEIGHT: 1 / 5,
            algoParamNames: [
                'UPDATE_WEIGHT',
                'CREATION_WEIGHT',
                'TRENDING_WEIGHT',
                'CREATE_NORM',
                'UPDATE_NORM',
                'TRENDING_NORM',
                'REACTIONS_TRENDING_WEIGHT'
            ],
            items: {},
            itemsCount: 15,
        };
    }

    createItems(n = 15) {
        const items = {};

        const newItem = {
            id: "New",
            reactions: 0,
            comments: 0,
            createdAt: 0,
            updatedAt: 0,
            name: "new item",
            color: 'red',
        }

        for (let i = 0; i < n; i++) {
            const item = i === 0 ? newItem : createItem(this.state.CREATE_NORM);

            items[item.id] = item;
        }

        this.setState({items, selected: newItem.id});
    }

    componentDidMount() {
        this.createItems()
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

    renderItems(itemScores, disabled = false, isOrderedTrending = false) {
        return (
            <ol>
                {itemScores.map(
                    (
                        {
                            createScore,
                            item,
                            totalOrderScore,
                            totalScore,
                            trendingOrderScore,
                            trendingRate,
                            trendingScore,
                            updateScore,
                        },
                        i
                    ) => (
                        <li
                            key={i}
                            className={item.id === this.state.selected ? "selected" : ""}
                            style={{borderLeft: `15px ${item.color} solid`}}
                        >
                            <h2>
                                {item.name && <span className="name">[{item.name}]</span>}
                                TotalScore: {(isOrderedTrending ? totalOrderScore : totalScore).toFixed(6)}
                            </h2>
                            <h3><u>Trending
                                Score {(isOrderedTrending ? trendingOrderScore : trendingScore).toFixed(5)}</u></h3>
                            <h3>Update Score {updateScore.toFixed(5)}</h3>
                            <h3>Publish Score {createScore.toFixed(5)}</h3>

                            {item.id !== this.state.selected
                                ? (<button className='selectButton'
                                           onClick={() => {
                                               this.setState({selected: item.id})
                                           }}
                                >Select</button>)
                                : null
                            }

                            <hr/>

                            <b><i style={{color: item.color}}>{item.id}</i></b>

                            <div style={{display: 'flex', justifyContent: 'space-around'}}>
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
                                        <i>days ago{' '}{!disabled ? `(max:${this.state.CREATE_NORM})` : ''}</i>
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
                                        <i>days
                                            ago {' '}{!disabled ? `(max:${Math.min(this.state.UPDATE_NORM, item.createdAt)})` : ''}</i>
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
            </ol>
        )
    }

    render() {
        const {CREATION_WEIGHT, UPDATE_WEIGHT, TRENDING_WEIGHT} = this.state;
        const items = Object.values(this.state.items);
        const itemScores = getItemScores(items, this.state).sort(({totalScore: a}, {totalScore: b}) => b - a)
        const itemScores_ordered_trending = getItemScores(items, this.state).sort(({totalOrderScore: a}, {totalOrderScore: b}) => b - a)

        return (
            <div>
                <h1>Params v0.0.2</h1>

                <div>
                    {Object.entries(this.state)
                        .filter(([key]) => this.state.algoParamNames.includes(key))
                        .map(([key, value], i) => {
                            return (
                                <div key={i}>
                                    {key}
                                    <input
                                        step={['REACTIONS_TRENDING_WEIGHT', 'TRENDING_WEIGHT', 'UPDATE_WEIGHT', 'CREATION_WEIGHT'].includes(key) ? 0.1 : 1}
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
                    <small> Max trending rate: {itemScores.maxTrendingRate.toFixed(3)} <br/></small>
                    <small>
                        Total Score = <b>{UPDATE_WEIGHT}</b> * updateScore + <b>{CREATION_WEIGHT} </b>*
                        creationScore + <b>{TRENDING_WEIGHT}</b> * trendingScore
                    </small>
                </div>


                <hr/>

                <button onClick={() => {
                    this.createItems(this.state.itemsCount);
                }}>Regenerate
                </button>
                Items Count
                <input
                    type="number"
                    value={this.state.itemsCount}
                    min={1}
                    onChange={(e) => {
                        this.updateParam('itemsCount', parseFloat(e.target.value));
                    }}
                />

                <hr/>

                <div>
                    <div style={{position: "fixed", right: 100}}>
                        {this.state.selected && itemScores.length
                            ? this.renderItems([itemScores.find(({item: {id}}) => id === this.state.selected)])
                            : <li>Select item to edit</li>
                        }
                    </div>

                    <Plot
                        data={[
                            {
                                y: itemScores.map(({trendingScore}) => trendingScore.toFixed(3)),
                                type: 'box',
                                name: 'Value based trending score',
                            }, {
                                y: itemScores.map(({trendingOrderScore}) => trendingOrderScore.toFixed(3)),
                                type: 'box',
                                name: 'Order based trending score',
                            },

                        ]}
                        layout={{
                            width: 600, height: 400, title: 'Trending Score distribution', showlegend: true,
                            xaxis: {
                                showticklabels: false
                            },
                            yaxis: {
                                dtick: 0.1,
                            },
                        }}
                        config={{displayModeBar: false, editable: false,}}
                    />
                    <div className='container'>
                        <div>
                            <h2 style={{textAlign: 'center'}}>Value based trending score</h2>
                            {this.renderItems(itemScores, true)}
                        </div>
                        <div>
                            <h2 style={{textAlign: 'center'}}>Order based trending score</h2>
                            {this.renderItems(itemScores_ordered_trending, true, true)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
