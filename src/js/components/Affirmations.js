var React = require('react');
import { RaisedButton, FlatButton } from 'material-ui';
import { Link } from 'react-router';
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');

export default class About extends React.Component {
    static defaultProps = {}
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        util.set_title("Affirmations");
    }

    render() {
        let { user } = this.props;
        let _feedback;
        if (user) _feedback = (
            <div>
                <h3>This is my personal flow dashboard.</h3>

                <p>I don't offer support for it, but if you, you can get in touch via Github, or email collinmesser (gmail).</p>
            </div>
        )
        return (
            <div>
                <div className="text-center">
                    <h2 style={{ marginTop: "40px", marginBottom: "60px" }}>Affirmations v.6</h2>
                    <p className="lead" style={{ fontSize: "1.45em" }}>{AppConstants.TAGLINE}</p>

                    <div className="row text-left">
                        <ul>
                            <li className="lead" style={{ fontSize: "1.45em" }}>I am lovingly supporting my children and encouraging them to fully express their unique talents and gifts.</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>I am lovingly supporting my wife to help her achieve her dreams and thrive every day.</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>I have the ability to accumulate people, resources, and capital to support all my goals.</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>I am so happy and grateful that I am now earning $150,000 a year.</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>I am so happy and grateful that I have my own business to run that brings me limitless resources.</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>I am a compelling public speaker that crushes presentations and gets paid to do it.</li>
                        </ul>
                    </div>
                </div>
                <div className="text-center">
                    <h2 style={{ marginTop: "40px", marginBottom: "60px" }}>Quotes to Life By</h2>
                    <p className="lead" style={{ fontSize: "1.45em" }}>These quotes are themes that I'm trying to instill in my life consistently. Last Edit: 11/11/19</p>

                    <div className="row text-left">
                        <ul>
                            <li className="lead" style={{ fontSize: "1.45em" }}>Regret is a whole lot longer and more painful than any instant rejection of going for the entrepreneur goal</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>You only have one life and it'll be over before you know it. Memento Mori - Remember your mortality</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>Done is better than perfect</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>Discipline is just choosing between what you want now and what you want most. Discipline is freedom.</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>I can only teach my kids what I live myself.</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>I am imperfect. But I can still strive for excellence.</li>

                        </ul>
                    </div>
                </div>

            </div>
        );
    }
}
