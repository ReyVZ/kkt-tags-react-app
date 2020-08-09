import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import generator from './generator'

const doc_types = [1, 11, 2, 3, 31, 301, 4, 41, 401, 5];
const old_tags = generator.slice(0, 15);

function DocTypes(props) {
    const doc_types = props.doc_types;
    const selected_doc_types = props.selected_doc_types;
    const list_items = doc_types.map((doc_type) =>
        <button key={doc_type} type="button" className={selected_doc_types.indexOf(doc_type) !== -1 ?
            "btn btn-light btn-outline-secondary mr-sm-1 active" : "btn btn-light btn-outline-secondary mr-sm-1"
        }
            onClick={() => props.onClick(doc_type)}
        >{doc_type}</button>
    );
    return (
        <div className="row justify-content-center">
            <div className="col-12">
                <div className="card border-white text-center">
                    <div className="card-body">{list_items}</div>
                </div>
            </div>
        </div>
    );
}

class Tags extends React.Component {
    constructor(props) {
        super(props);
        this.state = { aggr: {} };
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        let aggr = this.state.aggr;
        aggr[event.target.name] = event.target.value;
        this.setState({ aggr: aggr })
    }
    render() {
        const tags = this.props.tags;
        const selected_tags = this.props.selected_tags;
        const list_items = tags.map((tag) =>
            <tr key={tag.id} className={selected_tags.indexOf(tag.id) !== -1 ? "table-success" : ""} >
                <th scope="row">{tag.key}</th>
                <td>{tag.description}</td>
                <td>{tag.default}</td>
                <td>{tag.aggr &&
                    <div className="input-group">
                        <select
                            name={tag.id} value={tag.id in this.state.aggr ? this.state.aggr[tag.id] : "0"}
                            className="custom-select"
                            disabled={selected_tags.indexOf(tag.id) !== -1 ? true : false}
                            onChange={this.handleChange}
                        >
                            <option value="0">Функция...</option>
                            <option value="1">Сумма</option>
                            <option value="2">Среднее</option>
                            <option value="3">Кол-во</option>
                        </select>
                    </div>
                }
                </td>
                <td>{tag.doc}</td>
                <td>
                    <button type="button" onClick={() => this.props.onClick(tag.id, this.state.aggr[tag.id])}
                        className="btn btn-light btn-outline-secondary btn-sm">
                        {selected_tags.indexOf(tag.id) !== -1 ? "Удалить" : "Добавить"}
                    </button>
                </td>
            </tr>
        );
        return (
            <div className="row justify-content-center" >
                <div className="col-12">
                    <table className="table table-hover">
                        <thead className="thead-light">
                            <tr>
                                <th scope="col">Ключ</th>
                                <th scope="col">Описание</th>
                                <th scope="col">Название столбца</th>
                                <th scope="col">Агрегирование</th>
                                <th scope="col">Типы документов</th>
                                <th scope="col">Добавить/Удалить</th>
                            </tr>
                        </thead>
                        <tbody>{list_items}</tbody>
                    </table>
                </div>
            </div>
        );
    }
}

function Output(props) {
    return (
        <div className="row justify-content-center">
            <div className="col-12">
                <div className="card border-white text-center">
                    <div className="card-body">
                        <pre className="card-text text-left">{props.value}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            head: "{\n\t\"filter\":{\n\t\t\"forDocumentTypes\": [",
            types: [],
            fields: "]\n\t},\n\t\"output\": {\n\t\t\"fields\": [",
            tags: [],
            aggrs: {},
            foot: "\n\t\t]\n\t}\n}",
            dct: [] 
        };
    }
    componentDidMount() {
        fetch('http://localhost:8080/generator')
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        dct: result
                    });
                },
                (error) => {
                    this.setState({
                        dct: old_tags
                    });
                }
            )
    }
    handleAddDocType(x) {
        let types = this.state.types;
        if (types.indexOf(x) === -1) {
            types.push(x);
        } else {
            types.splice(types.indexOf(x), 1);
        }
        this.setState({ types: types });
    }
    handleAddTag(x, y) {
        let tags = this.state.tags;
        let aggrs = this.state.aggrs;
        if (tags.indexOf(x) === -1) {
            tags.push(x);
            switch (y) {
                case "1":
                    aggrs[x] = "sum";
                    break;
                case "2":
                    aggrs[x] = "average";
                    break;
                case "3":
                    aggrs[x] = "count";
                    break;
                default:
                    break;
            }
        } else {
            tags.splice(tags.indexOf(x), 1);
            delete aggrs[x];
        }
        this.setState({ tags: tags, aggrs: aggrs });
    }
    render() {
        let output_tags = ''
        let dct = this.state.dct;
        output_tags = this.state.tags.map((el) => "\n\t\t\t\"key\": \"" + dct[el].key + "\"" +
            (el in this.state.aggrs ? (", \"function\": \"" + this.state.aggrs[el] + "\"") : ""));
        return (
            <div>
                <DocTypes doc_types={doc_types} selected_doc_types={this.state.types}
                    onClick={(x) => this.handleAddDocType(x)} />
                <Output value={this.state.head + this.state.types + this.state.fields + output_tags + this.state.foot} />
                <Tags tags={dct} selected_tags={this.state.tags}
                    onClick={(x, y) => this.handleAddTag(x, y)} />
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
