import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Image,
  AlertIOS,
  ScrollView,
  ActivityIndicator,
  ListView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import mainStyles from '../styles/components/_Main';
import indicatorStyles from '../styles/common/_Indicator';
import styles from '../styles/containers/_TopicDetail';
import Header from '../components/Header';
import ReplyModal from '../components/modal/ReplyModal';
import Comment from '../components/Comment';
import Content from '../components/Content';
import VoteList from '../components/VoteList';
import RewardList from '../components/RewardList';
import { PopButton, ReplyButton, CommentButton } from '../components/button';
import {
  fetchTopic,
  resetTopic,
  submit,
  resetReply,
  publishVote,
  resetVote
} from '../actions/topic/topicAction';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class TopicDetail extends Component {
  constructor(props) {
    super(props);

    this.topicId = props.passProps.topic_id;
    this.boardId = props.passProps.board_id;
    this.boardName = props.passProps.board_name;

    this.state = {
      isReplyModalOpen: false,
      currentContent: null
    };
  }

  componentDidMount() {
    this.fetchTopic();
  }

  componentWillUnmount() {
    this.props.resetTopic();
  }

  componentWillReceiveProps(nextProps) {
    let { topicItem } = nextProps;

    if (topicItem.errCode) {
      AlertIOS.alert('提示', topicItem.errCode);
      nextProps.resetTopic();
      nextProps.router.pop();
    }
  }

  fetchTopic() {
    this.props.fetchTopic(this.topicId);
  }

  _endReached() {
    let {
      hasMore,
      isFetching,
      isEndReached,
      page
    } = this.props.topicItem;

    if (!hasMore || isFetching || isEndReached) { return; }

    this.props.fetchTopic(this.topicId, true, page + 1);
  }

  _renderHeader(topic, token, vote) {
    let create_date = moment(+topic.create_date).startOf('minute').fromNow();
    let commentHeaderText =
      topic.replies > 0 ? (topic.replies + '条评论') : '还没有评论，快来抢沙发！';

    return (
      <View>
        <View>
          <Text style={styles.title}>{topic.title}</Text>
          <View style={styles.info}>
            <Icon
              style={styles.views}
              name='eye'>
              {topic.hits}
            </Icon>
            <Icon
              style={styles.comments}
              name='comments'>
              {topic.replies}
            </Icon>
          </View>
        </View>
        <View style={styles.postContent}>
          <View style={styles.authorInfo}>
            <View style={styles.avatarWapper}>
              <Image
               style={styles.avatar}
               source={{ uri: topic.icon }} />
            </View>
            <View style={styles.author}>
              <Text style={styles.name}>{topic.user_nick_name}</Text>
              <Text style={styles.level}>{topic.userTitle}</Text>
            </View>
            <Text style={styles.floor}>楼主</Text>
          </View>
          <View style={styles.content}>
            <Content content={topic.content}
                     router={this.props.router} />
            {topic.poll_info &&
              <VoteList
                pollInfo={topic.poll_info}
                vote={vote}
                publishVote={voteIds => this._publishVote(voteIds)}
                resetVote={() => this._resetVote()}
                fetchTopic={() => this.fetchTopic()} />
            }
          </View>
          {topic.reward &&
            <RewardList reward={topic.reward}
                        router={this.props.router} />}
          <View style={styles.other}>
            <Text style={styles.date}>{create_date}</Text>
            {!!topic.mobileSign &&
              <View style={styles.mobileWrapper}>
                <Icon style={styles.mobileIcon} name='mobile' />
                <Text style={styles.mobileText}>{topic.mobileSign}</Text>
              </View>
            }
            {token &&
              <CommentButton
                style={styles.reply}
                onPress={() => this.toggleReplyModal(true, topic)} />
            }
          </View>
        </View>
        <View style={styles.commentHeader}>
          <Text style={styles.commentHeaderText}>
            {commentHeaderText}
          </Text>
        </View>
      </View>
    );
  }

  _renderFooter() {
    let {
      hasMore,
      isEndReached
    } = this.props.topicItem;

    if (!hasMore || !isEndReached) { return; }

    return (
      <View style={indicatorStyles.endRechedIndicator}>
        <ActivityIndicator />
      </View>
    );
  }

  _publish({ content, replyId }) {
    this.props.submit(
      this.boardId,
      this.topicId,
      replyId,
      null,
      null,
      content
    );
  }

  _publishVote(voteIds) {
    this.props.publishVote(
      this.topicId,
      voteIds
    );
  }

  _resetVote() {
    this.props.resetVote();
  }

  toggleReplyModal(visible, content) {
    this.setState({
      isReplyModalOpen: visible,
      currentContent: content
    });
  }

  render() {
    let { topicItem, reply, vote, user } = this.props;
    let { isReplyModalOpen, currentContent } = this.state;

    if (topicItem.isFetching || !topicItem.topic || !topicItem.topic.topic_id) {
      return (
        <View style={mainStyles.container}>
          <Header title={this.boardName}>
            <PopButton router={this.props.router} />
          </Header>
          <View style={indicatorStyles.fullScreenIndicator}>
            <ActivityIndicator />
          </View>
        </View>
      );
    }

    let topic = topicItem.topic;
    let token = user.authrization.token;
    let commentSource = ds.cloneWithRows(topicItem.list);

    return (
      <View style={mainStyles.container}>
        {isReplyModalOpen &&
          <ReplyModal
            {...this.props}
            visible={isReplyModalOpen}
            content={currentContent}
            reply={reply}
            isReplyInTopic={true}
            handlePublish={comment => this._publish(comment)}
            closeReplyModal={() => this.toggleReplyModal(false)}
            fetchTopic={() => this.fetchTopic()} />
        }

        <Header title={this.boardName}>
          <PopButton router={this.props.router} />
          {token &&
            <ReplyButton onPress={() => this.toggleReplyModal(true)} />
            ||
            <Text></Text>
          }
        </Header>
        <ListView
          style={styles.commentList}
          dataSource={commentSource}
          enableEmptySections={true}
          renderRow={comment =>
            <Comment
              key={comment.reply_posts_id}
              comment={comment}
              token={token}
              router={this.props.router}
              openReplyModal={() => this.toggleReplyModal(true, comment)} />
          }
          onEndReached={() => this._endReached()}
          onEndReachedThreshold={0}
          renderHeader={() => this._renderHeader(topic, token, vote)}
          renderFooter={() => this._renderFooter()} />
      </View>
    );
  }
}

function mapStateToProps({ topicItem, reply, vote, user }) {
  return {
    topicItem,
    reply,
    vote,
    user
  };
}

export default connect(mapStateToProps, {
  submit,
  resetReply,
  fetchTopic,
  resetTopic,
  publishVote,
  resetVote
})(TopicDetail);
