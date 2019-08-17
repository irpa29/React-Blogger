import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'

import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Skeleton from '@material-ui/lab/Skeleton'
import IconButton from '@material-ui/core/IconButton'
import Badge from '@material-ui/core/Badge'
import Link from '@material-ui/core/Link'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

import Avatar from '@material-ui/core/Avatar'
import { indigo, grey } from '@material-ui/core/colors'

import CommentIcon from '@material-ui/icons/Comment'
import ShareIcon from '@material-ui/icons/Share'

import CommentList from './CommentList'

import axios from 'axios'
import jsonpAdapter from 'axios-jsonp'
import { Box } from '@material-ui/core'
import LinesEllipsis from 'react-lines-ellipsis'
import TimeAgo from 'react-timeago'

const styles = theme => ({
    avatar: {
        backgroundColor: indigo[500]
    },
    dateClass: {
        color: grey[500]
    },
    box: {
        paddingTop: theme.spacing(1.5),
        paddingBottom: theme.spacing(1.5),
        [theme.breakpoints.up('sm')]: {
            paddingLeft: theme.spacing(1.5),
            paddingRight: theme.spacing(1.5)
        }
    },
    card: {
        marginBottom: theme.spacing(2)
    },
    skeletonTitle: {
        margin: theme.spacing(1, 0)
    },
    skeletoSubHeader: {
        margin: theme.spacing(0, 0, 0.5, 0)
    },
    skeletonContent: {
        paddingBottom: theme.spacing(0)
    },
    skeletoText: {
        marginBottom: theme.spacing(1)
    },
    iconMarginRight: {
        marginRight: theme.spacing(1.5)
    }
})


class PostPage extends Component {
    state = {
        post: null,
        isFetch: false,
        commentButtonHide: false,
        isFetchComment: false,
        commentList: [],
        commentReplyList: [],
        setAnchorEl: null,
        shareURL: "",
        newComment: true
    }

    commentRef = React.createRef()

    componentDidMount() {
        axios({
            url: `/feeds/posts/default?q=${document.title}&alt=json-in-script`,
            adapter: jsonpAdapter,
            callbackParamName: 'p'
        }).then(res => {
            if (res.data.feed.entry) {
                const post = res.data.feed.entry.filter(arr => arr.link.filter(arr1 => arr1.rel === "alternate")[0].href.includes(document.location.pathname) && arr.title.$t === document.title)[0]
                this.setState({ post, isFetch: true })
                this.props.updateLabel(res.data.feed.category)
            }
        })
    }

    fetchCommentList() {
        axios({
            url: `/feeds/${this.state.post.id.$t.split("-").pop()}/comments/default?alt=json-in-script&reverse=false&orderby=published&start-index=1`,
            adapter: jsonpAdapter,
            callbackParamName: 'c'
        }).then(res => {
            if (res.data.feed.entry) {
                const processMap = res.data.feed.entry.map((arr) => {
                    let id = arr.id.$t.split("-").pop()
                    let related = arr.link.filter((arr) => arr.rel === "related")
                    related = Boolean(related.length) && related[0].href.split("/").pop()
                    arr.related = related
                    arr.id = id
                    return arr
                })
                const commentList = processMap.filter(arr => arr.related === !1)
                const commentReplyList = processMap.filter(arr => typeof arr.related === "string")
                this.setState({ commentList, commentReplyList, isFetchComment: true })
            }
        })
    }

    newReply = () => {
        this.setState({ newComment: false })
    }

    newComment = () => {
        this.setState({ newComment: true })
    }

    render() {
        const { classes } = this.props;
        return (
            <Grid item xs={12} sm={8} className={classes.box}>
                <Card className={classes.card}>
                    {!this.state.isFetch ? (
                        <React.Fragment>
                            <CardContent className={classes.skeletonContent}>
                                <Typography variant="h5" component="h2">
                                    <Skeleton height={19} className={classes.skeletonTitle} />
                                    <Skeleton height={19} className={classes.skeletonTitle} />
                                </Typography>
                            </CardContent>
                            <CardHeader
                                avatar={
                                    <Skeleton variant="circle" width={40} height={40} className={classes.Avatar} />
                                }
                                title={
                                    <Skeleton height={14} className={classes.skeletoSubHeader} />
                                }
                                subheader={
                                    <Skeleton height={12} width="40%" className={classes.skeletoSubHeader} />
                                }
                            />
                            <Box p={2}>
                                <Skeleton height={16} className={classes.skeletoText} />
                                <Skeleton height={16} className={classes.skeletoText} />
                                <Skeleton height={16} className={classes.skeletoText} />
                                <Skeleton height={300} className={classes.skeletoText} />
                                <Skeleton height={16} className={classes.skeletoText} />
                                <Skeleton height={16} className={classes.skeletoText} />
                            </Box>
                        </React.Fragment>
                    ) : (
                            <React.Fragment>
                                <CardContent className={classes.skeletonContent}>
                                    <Typography variant="h5" component="h2">
                                        <LinesEllipsis text={this.state.post.title.$t} maxLine='2' ellipsis='...' trimRight basedOn='letters' />
                                    </Typography>
                                </CardContent>
                                <CardHeader
                                    avatar={
                                        <Avatar aria-label="recipe" className={classes.avatar}>R</Avatar>
                                    }
                                    action={
                                        <React.Fragment>
                                            <IconButton aria-label="Comment" onClick={() => {
                                                this.commentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                            }}>
                                                <Badge badgeContent={this.state.post.thr$total.$t} color="secondary">
                                                    <CommentIcon />
                                                </Badge>
                                            </IconButton>
                                            <IconButton aria-label="Share" aria-controls="Share-menu" aria-haspopup="true" onClick={(event) => {
                                                const url = this.state.post.link.filter(arr => arr.rel === "alternate").map(arr => arr.href).toString()
                                                this.setState({ setAnchorEl: event.currentTarget, shareURL: url })
                                            }}>
                                                <ShareIcon />
                                            </IconButton>
                                        </React.Fragment>
                                    }
                                    title={this.state.post.author[0].name.$t}
                                    subheader={
                                        <Typography variant="caption" display="block" className={classes.dateClass}><TimeAgo date={this.state.post.published.$t} /></Typography>
                                    }
                                />
                                <Divider />
                                <Box p={2} dangerouslySetInnerHTML={{ __html: this.state.post.content.$t }} ></Box>

                            </React.Fragment>
                        )}
                </Card>
                <Box ref={this.commentRef}></Box>
                {
                    this.state.isFetch && this.state.post.thr$total.$t !== "0" ? (
                        <React.Fragment>
                            {!this.state.commentButtonHide ? (
                                <Box textAlign="center" mb={2}><Button variant="contained" size="large" color="primary" onClick={
                                    () => {
                                        this.setState({ commentButtonHide: true })
                                        this.fetchCommentList()
                                    }
                                }>Load {this.state.post.thr$total.$t + " "}Comment{(this.state.post.thr$total.$t > 1 ? "s" : null)}</Button></Box>
                            ) : <CommentList commentList={this.state.commentList} commentReplyList={this.state.commentReplyList} totalComment={this.state.post.thr$total.$t} isFetchComment={this.state.isFetchComment} blogID={/blog-?(\d+)\./.exec(this.state.post.id.$t)[1]} postID={this.state.post.id.$t.split("-").pop()} newReply={this.newReply} isComment={this.state.newComment} />}
                        </React.Fragment>
                    ) : null
                }
                {
                    this.state.isFetch ? (
                        <React.Fragment>
                            {
                                this.state.newComment ? (
                                    <Card>
                                        <CardContent>
                                            <iframe title="iframe-comment" frameBorder="0" src={"//www.blogger.com/comment-iframe.g?blogID=" + /blog-?(\d+)\./.exec(this.state.post.id.$t)[1] + "&postID=" + this.state.post.id.$t.split("-").pop() + "&skin=contempo"} width="100%" height="284px"></iframe>
                                        </CardContent>
                                    </Card>
                                ) : (
                                        <Box textAlign="center" mb={2}><Button variant="contained" size="large" color="primary" onClick={
                                            () => {
                                                this.newComment()
                                            }
                                        }>New Comment</Button></Box>
                                    )
                            }
                        </React.Fragment>
                    ) : null
                }
                <Menu
                    id="Share-menu"
                    anchorEl={this.state.setAnchorEl}
                    keepMounted
                    open={Boolean(this.state.setAnchorEl)}
                    onClose={() => {
                        this.setState({ setAnchorEl: null })
                    }}
                >
                    <Link
                        color="inherit"
                        component="a"
                        underline="none"
                        href={"//twitter.com/share?url=" + this.state.shareURL}
                        target="_blank"
                        rel="noreferrer"
                    ><MenuItem>Twitter</MenuItem></Link>
                    <Link
                        color="inherit"
                        component="a"
                        underline="none"
                        href={"//www.facebook.com/sharer/sharer.php?u=" + this.state.shareURL}
                        target="_blank"
                        rel="noreferrer"
                    ><MenuItem>Facebook</MenuItem></Link>
                </Menu>
            </Grid >
        )
    }
}

export default withStyles(styles)(PostPage);