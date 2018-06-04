/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50717
Source Host           : 172.20.128.2:3306
Source Database       : steemitgame

Target Server Type    : MYSQL
Target Server Version : 50717
File Encoding         : 65001

Date: 2018-04-16 15:40:49
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for activities
-- ----------------------------
DROP TABLE IF EXISTS `activities`;
CREATE TABLE `activities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gameid` int(11) DEFAULT NULL,
  `account` varchar(255) DEFAULT NULL,
  `userid` int(11) DEFAULT NULL,
  `permlink` varchar(255) DEFAULT NULL,
  `vote` int(11) DEFAULT '0',
  `payout` double DEFAULT '0',
  `lastModified` int(11) DEFAULT NULL,
  `status` tinyint(4) DEFAULT '0' COMMENT '0未结算，1已结算',
  PRIMARY KEY (`id`),
  KEY `account_game` (`gameid`,`account`,`permlink`,`userid`,`status`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gameid` int(11) DEFAULT NULL,
  `account` varchar(255) DEFAULT NULL,
  `userid` int(11) DEFAULT NULL,
  `comment` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `type` tinyint(4) DEFAULT '0' COMMENT '0 report, 1 audit comment',
  `permlink` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `lastModified` int(11) DEFAULT NULL,
  `status` tinyint(4) DEFAULT '0' COMMENT '0有效，1无效',
  PRIMARY KEY (`id`),
  KEY `account_game` (`gameid`,`account`,`userid`,`permlink`,`status`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for games
-- ----------------------------
DROP TABLE IF EXISTS `games`;
CREATE TABLE `games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account` varchar(250) NOT NULL,
  `userid` int(11) NOT NULL,
  `title` varchar(128) DEFAULT NULL,
  `coverImage` varchar(500) DEFAULT NULL,
  `description` tinytext,
  `category` varchar(100) DEFAULT NULL,
  `version` varchar(50) DEFAULT NULL,
  `gameUrl` varchar(500) DEFAULT NULL,
  `vote` int(11) DEFAULT '0',
  `payout` double(255,2) DEFAULT '0.00',
  `width` int(11) DEFAULT '0',
  `height` int(11) DEFAULT '0',
  `created` int(11) NOT NULL,
  `lastModified` int(11) DEFAULT NULL,
  `report` tinyint(1) DEFAULT '0' COMMENT '0 未举报，1 被举报',
  `activities` int(8) DEFAULT '0',
  `status` tinyint(1) DEFAULT '0' COMMENT '0未审核submitted，1已审核approved，2未通过审核denied，3已删除deleted',
  `recommend` tinyint(1) DEFAULT '0' COMMENT '0未推荐，1推荐',
  PRIMARY KEY (`id`),
  KEY `account` (`account`) USING BTREE,
  KEY `userid` (`userid`) USING BTREE,
  KEY `status` (`status`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5088 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account` varchar(100) DEFAULT NULL,
  `userid` int(11) DEFAULT NULL,
  `role` int(11) DEFAULT '0' COMMENT '0 user 1 audit 2 admin',
  `status` tinyint(4) DEFAULT '1',
  `created` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userid` (`userid`) USING BTREE,
  UNIQUE KEY `username` (`account`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;
SET FOREIGN_KEY_CHECKS=1;
