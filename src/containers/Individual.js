import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableHighlight
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';
import TopicList from '../components/TopicList';
import { PopButton } from '../components/button';
import colors from '../styles/common/_colors';
import scrollableTabViewStyles from '../styles/common/_ScrollableTabView';
import mainStyles from '../styles/components/_Main';
import styles from '../styles/containers/_Individual';
import { invalidateUserTopicList, fetchUserTopicListIfNeeded } from '../actions/user/topicListAction';

class Individual extends Component {
  constructor(props) {
    super(props);

    let {
      user: {
        authrization: {
          uid
        }
      },
    } = this.props;
    this.userId = uid;
  }

  componentDidMount() {
    this.props.fetchUserTopicListIfNeeded(this.userId, false, 'topic');
  }

  _refreshUserTopicList(page, isEndReached, type) {
    this.props.invalidateUserTopicList();
    this.props.fetchUserTopicListIfNeeded(this.userId, isEndReached, type, page);
  }

  changeTab(e) {
    if (e.i === 1) {
      this.props.fetchUserTopicListIfNeeded(this.userId, false, 'reply');
    }
  }

  render() {
    let {
      router,
      user: {
        authrization: {
          uid,
          avatar,
          userName,
          userTitle,
          creditShowList
        }
      },
      userTopicList
    } = this.props;

    return (
      <View style={mainStyles.container}>
        <Header
          style={styles.nav}
          updateMenuState={isOpen => this.props.updateMenuState(isOpen)} />
        <View style={styles.header}>
          <Image style={styles.avatar} source={{ uri: avatar }} />
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <ScrollableTabView
          tabBarActiveTextColor={colors.blue}
          tabBarInactiveTextColor={colors.lightBlue}
          tabBarUnderlineStyle={scrollableTabViewStyles.tabBarUnderline}
          tabBarTextStyle={scrollableTabViewStyles.tabBarText}
          onChangeTab={e => this.changeTab(e)}>
          <TopicList
            tabLabel='最近发表'
            router={router}
            typeId={uid}
            isIndividual={true}
            individualType='topic'
            topicList={userTopicList}
            refreshTopicList={(page, isEndReached, type) => this._refreshUserTopicList(page, isEndReached, type)} />
          <TopicList
            tabLabel='最近回复'
            router={router}
            typeId={uid}
            isIndividual={true}
            individualType='reply'
            topicList={userTopicList}
            refreshTopicList={(page, isEndReached, type) => this._refreshUserTopicList(page, isEndReached, type)} />
        </ScrollableTabView>
      </View>
    );
  }
}

function mapStateToProps({ user, userTopicList }) {
  return {
    user,
    userTopicList
  };
}

export default connect(mapStateToProps, {
  invalidateUserTopicList,
  fetchUserTopicListIfNeeded
})(Individual);
